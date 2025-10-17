var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/ping', function(req, res, next) {
  res.send('pong');
});

// Add this route to calculate watering durations on-the-fly

router.get('/api/watering-stats/daily', async function(req, res) {
  try {
    const { Op } = require('sequelize');
    const LogEvent = require('../models/LogEvent');
    
    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Fetch all watering-related events from the past 30 days
    const wateringEvents = await LogEvent.findAll({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        },
        [Op.or]: [
          { event_type: { [Op.like]: '%water%' } },
          { event_type: { [Op.like]: '%irrigation%' } },
          { event_type: { [Op.like]: '%pin%' } }
        ]
      },
      order: [['createdAt', 'DESC'], ['id', 'DESC']], // Most recent first
      raw: true
    });
    
    // Calculate durations by matching on/off pairs
    const dailyTotals = calculateDailyWateringDurations(wateringEvents);
    
    // Fill in missing days with 0 values for the past 30 days
    const result = [];
    const currentDate = new Date(thirtyDaysAgo);
    
    while (currentDate <= new Date()) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayTotal = dailyTotals[dateStr] || 0;
      
      result.push({
        date: dateStr,
        total_minutes: dayTotal
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching watering stats:', error);
    res.status(500).json({ error: 'Failed to fetch watering statistics' });
  }
});

function calculateDailyWateringDurations(events) {
  const dailyTotals = {};
  const channelStacks = {}; // Track on events waiting for off events per channel
  
  // Process events from most recent to oldest
  for (const event of events) {
    const eventDate = event.createdAt.toISOString().split('T')[0];
    const isOnEvent = isWateringOnEvent(event.event_type);
    const isOffEvent = isWateringOffEvent(event.event_type);
    const channel = extractChannel(event); // Extract channel/pin identifier
    
    if (!dailyTotals[eventDate]) {
      dailyTotals[eventDate] = 0;
    }
    
    if (isOffEvent) {
      // This is an "off" event - push it to the stack for this channel
      if (!channelStacks[channel]) {
        channelStacks[channel] = [];
      }
      channelStacks[channel].push({
        event: event,
        offTime: new Date(event.createdAt)
      });
    } 
    else if (isOnEvent) {
      // This is an "on" event - try to match with the most recent "off" event for this channel
      if (channelStacks[channel] && channelStacks[channel].length > 0) {
        const offEvent = channelStacks[channel].shift(); // Get the most recent off event
        const onTime = new Date(event.createdAt);
        const offTime = offEvent.offTime;
        
        // Calculate duration in minutes
        const durationMs = offTime.getTime() - onTime.getTime();
        const durationMinutes = Math.max(0, Math.round(durationMs / (1000 * 60)));
        
        // Add to the day when the watering STARTED (on event)
        const onEventDate = onTime.toISOString().split('T')[0];
        if (!dailyTotals[onEventDate]) {
          dailyTotals[onEventDate] = 0;
        }
        dailyTotals[onEventDate] += durationMinutes;
        
        console.log(`Matched watering: ${channel}, ${onTime} to ${offTime}, ${durationMinutes} minutes`);
      }
    }
  }
  
  return dailyTotals;
}

function isWateringOnEvent(eventType) {
  const type = eventType.toLowerCase();
  return (type.includes('water') || type.includes('irrigation') || type.includes('pin')) && 
         (type.includes('on') || type.includes('start') || type.includes('high'));
}

function isWateringOffEvent(eventType) {
  const type = eventType.toLowerCase();
  return (type.includes('water') || type.includes('irrigation') || type.includes('pin')) && 
         (type.includes('off') || type.includes('stop') || type.includes('low'));
}

function extractChannel(event) {
  // Extract channel/pin identifier from the event
  // Adjust this based on your event structure
  if (event.pin_number) return `pin_${event.pin_number}`;
  if (event.mac_id && event.pin_number) return `${event.mac_id}_pin_${event.pin_number}`;
  if (event.channel) return `channel_${event.channel}`;
  
  // Fallback: try to extract from event_type or other fields
  const match = event.event_type.match(/pin[\s_]?(\d+)|channel[\s_]?(\d+)/i);
  if (match) {
    return `pin_${match[1] || match[2]}`;
  }
  
  return 'default'; // Fallback channel
}

module.exports = router;
