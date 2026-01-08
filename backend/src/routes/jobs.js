const express = require('express');
const { auth, managerOrAdmin } = require('../middleware/authMiddleware');
const Job = require('../models/Job');
const Client = require('../models/Client');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      assignedTo,
      client,
      startDate,
      endDate,
      sortBy = 'scheduledDate',
      sortOrder = 'asc'
    } = req.query;

    const query = {};
    
    // Build query filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (assignedTo) query['assignedStaff.user'] = assignedTo;
    if (client) query.client = client;
    
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    // If user is staff, only show jobs assigned to them
    if (req.user.role === 'staff') {
      query['assignedStaff.user'] = req.user.id;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'client', select: 'firstName lastName email phone company' },
        { path: 'assignedStaff.user', select: 'firstName lastName email' }
      ]
    };

    const jobs = await Job.paginate(query, options);

    res.json({
      jobs: jobs.docs,
      totalPages: jobs.totalPages,
      currentPage: jobs.page,
      totalJobs: jobs.totalDocs
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client')
      .populate('assignedStaff.user', 'firstName lastName email phone')
      .populate('supplies.item');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if staff can access this job
    if (req.user.role === 'staff') {
      const isAssigned = job.assignedStaff.some(staff => 
        staff.user._id.toString() === req.user.id
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Access denied to this job' });
      }
    }

    res.json(job);

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error while fetching job' });
  }
});

// @route   POST /api/jobs
// @desc    Create new job
// @access  Private (Manager/Admin)
router.post('/', [auth, managerOrAdmin], async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      createdBy: req.user.id
    });

    await job.save();
    await job.populate('client assignedStaff.user');

    res.status(201).json({
      message: 'Job created successfully',
      job
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error while creating job' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (Manager/Admin)
router.put('/:id', [auth, managerOrAdmin], async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('client assignedStaff.user');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      message: 'Job updated successfully',
      job
    });

  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (Manager/Admin)
router.delete('/:id', [auth, managerOrAdmin], async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
});

// @route   PATCH /api/jobs/:id/status
// @desc    Update job status
// @access  Private
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, completionNotes, photos, rating, feedback } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check permissions
    if (req.user.role === 'staff') {
      const isAssigned = job.assignedStaff.some(staff => 
        staff.user.toString() === req.user.id
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    job.status = status;

    if (status === 'completed') {
      job.completion = {
        completedAt: new Date(),
        completedBy: req.user.id,
        notes: completionNotes,
        photos: photos || [],
        rating,
        feedback
      };
    }

    await job.save();
    await job.populate('client assignedStaff.user');

    res.json({
      message: 'Job status updated successfully',
      job
    });

  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ message: 'Server error while updating job status' });
  }
});

module.exports = router;