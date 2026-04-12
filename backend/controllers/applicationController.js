const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job
// @route   POST /api/jobs/:jobId/apply
// @access  Private (Seeker only)
const applyForJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: req.user.id
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        const application = await Application.create({
            job: jobId,
            applicant: req.user.id,
            resumeUrl: req.user.profile.resumeUrl || req.body.resumeUrl
        });

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get applicants for a job
// @route   GET /api/jobs/:jobId/applicants
// @access  Private (Recruiter owner only)
const getJobApplicants = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if recruiter owns the job
        if (job.recruiter.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to view these applicants' });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate('applicant', 'name email profile.skills profile.resumeUrl');

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get applied jobs for a user
// @route   GET /api/applications
// @access  Private (Seeker only)
const getAppliedJobs = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .populate({
                path: 'job',
                select: 'title companyName location salary'
            });

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// check commit
module.exports = {
    applyForJob,
    getJobApplicants,
    getAppliedJobs
};
