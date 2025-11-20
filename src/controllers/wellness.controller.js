const DailyWellness = require('../models/dailyWellness.model.js');

/**
 * @desc   
 * @route   POST /api/wellness/
 * @access  Private
 */
exports.createWellnessLog = async (req, res) => {
  const { mood, energy, stress, sleep } = req.body;

  if (mood === undefined || energy === undefined || stress === undefined || sleep === undefined) {
    return res.status(400).json({ success: false, error: 'Please provide all wellness metrics' });
  }

  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyLog = await DailyWellness.findOne({ user: userId, date: today });

    if (dailyLog) {
      if (dailyLog.logCount >= 3) {
        return res.status(400).json({ success: false, error: 'Maximum of 3 logs per day reached' });
      }
      dailyLog.logs.push({ mood, energy, stress, sleep });
    } else {
      dailyLog = new DailyWellness({
        user: userId,
        date: today,
        logs: [{ mood, energy, stress, sleep }]
      });
    }

    dailyLog.logCount = dailyLog.logs.length;

    let totalMood = 0, totalEnergy = 0, totalStress = 0, totalSleep = 0;
    for (const log of dailyLog.logs) {
      totalMood += log.mood;
      totalEnergy += log.energy;
      totalStress += log.stress;
      totalSleep += log.sleep;
    }

    dailyLog.averages.mood = totalMood / dailyLog.logCount;
    dailyLog.averages.energy = totalEnergy / dailyLog.logCount;
    dailyLog.averages.stress = totalStress / dailyLog.logCount;
    dailyLog.averages.sleep = totalSleep / dailyLog.logCount;

    await dailyLog.save();

    res.status(201).json({
      success: true,
      data: dailyLog
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Edit a specific wellness log
 * @route   PUT /api/wellness/:wellnessId
 * @access  Private
 */
exports.editWellnessLog = async (req, res) => {
  const { mood, energy, stress, sleep } = req.body;
  const { id } = req.params;

  if (mood === undefined || energy === undefined || stress === undefined || sleep === undefined) {
    return res.status(400).json({ success: false, error: 'Please provide all wellness metrics' });
  }

  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyLog = await DailyWellness.findOne({ user: userId, date: today });
    if (!dailyLog) {
      return res.status(404).json({ success: false, error: 'No wellness logs found for today' });
    }

    const log = dailyLog.logs.id(id);
    if (!log) {
      return res.status(404).json({ success: false, error: 'Log not found' });
    }

    // Update the log values
    log.mood = mood;
    log.energy = energy;
    log.stress = stress;
    log.sleep = sleep;

    // Recalculate averages
    const totalLogs = dailyLog.logs.length;
    let totalMood = 0, totalEnergy = 0, totalStress = 0, totalSleep = 0;
    for (const l of dailyLog.logs) {
      totalMood += l.mood;
      totalEnergy += l.energy;
      totalStress += l.stress;
      totalSleep += l.sleep;
    }

    dailyLog.averages.mood = totalMood / totalLogs;
    dailyLog.averages.energy = totalEnergy / totalLogs;
    dailyLog.averages.stress = totalStress / totalLogs;
    dailyLog.averages.sleep = totalSleep / totalLogs;

    await dailyLog.save();

    res.status(200).json({
      success: true,
      data: dailyLog
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Lấy dữ liệu wellness theo khoảng thời gian cho biểu đồ
 * @route   GET /api/wellness/trends?period=[today|week|month]
 * @route   GET /api/wellness/trends?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * @access  Private
 */
exports.getWellness = async (req, res) => {
  const { period, startDate: manualStartDate, endDate: manualEndDate } = req.query;

  let startDate, endDate;
  const now = new Date();

  if (period) {
    // --- Logic tính toán khoảng thời gian tự động ---
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;

      case 'week':
        // Giả định tuần bắt đầu từ Thứ Hai (Monday)
        const currentDay = now.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6
        const dayOffset = currentDay === 0 ? 6 : currentDay - 1; // Tính số ngày cần lùi lại để về Thứ Hai

        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOffset);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Thứ Hai + 6 ngày = Chủ Nhật
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);

        // Lấy ngày cuối cùng của tháng hiện tại
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid period specified. Use "today", "week", or "month".' });
    }
  } else if (manualStartDate && manualEndDate) {
    // --- Sử dụng khoảng thời gian thủ công nếu có ---
    startDate = new Date(manualStartDate);
    endDate = new Date(manualEndDate);
    endDate.setHours(23, 59, 59, 999); // Đảm bảo bao trọn ngày cuối
  } else {
    return res.status(400).json({ success: false, error: 'Please provide a period (today, week, month) or a startDate and endDate.' });
  }

  try {
    const trends = await DailyWellness.find({
      user: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .sort({ date: 'asc' })
      .select('date averages');

    res.status(200).json({
      success: true,
      query: {
        period: period || 'custom',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      count: trends.length,
      data: trends
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};