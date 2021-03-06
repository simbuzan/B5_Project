const Job = require("../models/job_offer");
const user = require("../models/user");
const User = require("../models/user");
const userController = require("./userController");
const { Client } = require('elasticsearch');
const errorController = require("./errorController");
const bonsai = process.env.BONSAI_URL || "http://localhost:9200";
const client = new Client({ host: bonsai });

module.exports = {

  /**
   * Shows only those job offers that are added
   * by a particular logged in recruiter.
   */
  indexJobOffers: (req, res, next) => {
    let currentUser = res.locals.user;

    if (typeof currentUser === "undefined") {
			let redirect = `/user/${currentUser._id}/offers`;
			errorController.respondNotLoggedin(req, res, redirect);
      }

    if (req.params.id != currentUser._id) {
      errorController.respondAccessDenied(req, res);
    }

    Job.find({ _id: { $in: currentUser.jobOffers } }).then(offers => {
      let mappedOffers = offers.filter(offer => { return JSON.stringify(offer.user) === JSON.stringify(currentUser._id) });
      res.locals.jobs = mappedOffers;
      next();
    }).catch(error => {
      console.error(`error while indexing job offers`, error);
      errorController.respondInternalError(req, res);
    });
  },

  renderJobOffers: (req, res) => {
    res.render("jobs/index");
  },

  renderSingleJobEdit: (req, res) => {
    let jobId = req.params.jobId;

    if (typeof req.app.locals.user === "undefined") {
			let redirect = `/jobs/${jobId}/edit`;
			errorController.respondNotLoggedin(req, res, redirect);
      }

    //if role not recruiter or job isn't in the job offers
    if (!(req.user.role = "recruiter" && req.user.jobOffers.includes(jobId))) {
      errorController.respondAccessDenied(req, res);
    }

    Job.findOne({ _id: jobId })
      .exec()
      .then((job) => {
        res.render("jobs/edit", {
          job: job,
        });
      })
      .catch((error) => {
				console.error(`Error while trying to find the job with id ${jobId}`, error);
				errorController.respondNotFound(req, res);
      });
  },

  /**
   * Renders the view of one single job.
   */
  renderSingleJob: (req, res, next) => {
    let jobId = req.params.jobId;

    if (typeof req.app.locals.user === "undefined") {
			let redirect = `/jobs/${jobId}/`;
			errorController.respondNotLoggedin(req, res, redirect);
      }

    Job.findById(jobId)
      .then((card) => {
        User.find({ _id: card.user }).then((user) => {
          let recruiterEmail;
          if (user[0]) {
            recruiterEmail = user[0].email;
          }
          res.render("jobs/showSingleJob", {
            card: card,
            email: recruiterEmail,
          });
          next();
        });
      })
      .catch((error) => {
				console.error(`Error while trying to find the job with id ${jobId}`, error);
				errorController.respondNotFound(req, res);
      });
  },

  updateJob: async (req, res) => {
    let jobId = req.params.jobId;
    let jobParams = userController.getJobParams(req, res);

    if (typeof req.app.locals.user === "undefined") {
			let redirect = `/jobs/${jobId}/edit`;
			errorController.respondNotLoggedin(req, res, redirect);
      }
      
    try {
      // update max_score
      jobParams.max_score = await userController.getMaxScore("recruiter", jobParams);

      let job = await Job.findOneAndUpdate({ _id: jobId }, { $set: jobParams }, { new: true });
      req.flash('success', `The job offer "${job.job_title}" has been successfully updated!`);
    } catch (error) {
      req.flash('error', `There has been an error while updating the job offer`);
      console.error(`Error updating job by ID: ${error.message}`);
    }

    // in any case, redirect
    res.redirect(`/user/${res.locals.user._id}/offers`);
  },

  /**
   * Delete the job offer from the whole jobs collection &
   * from the collection of job offers (jobOffers array in User) create by particular user.
   */
  deleteJob: (req, res) => {
    let jobId = req.params.jobId;
    let user = req.user;

    if (typeof user === "undefined") {
			let redirect = `/user/${user._id}/offers/`;
			errorController.respondNotLoggedin(req, res, redirect);
      }

    Job.findOneAndRemove({ _id: jobId })
      .then((job) => {
        // delete job from user's jobs array (both in MongoDB and ES)
        User.findOneAndUpdate({ _id: user._id },
          { $pull: { jobOffers: job._id } },
          { new: true }
        ).then((user) => {
          req.flash('success', `The job offer has been deleted successfully!`);
          res.redirect(`/user/${user._id}/offers`);
        })
      }).catch(error => {
        req.flash('error', `There has been an error while deleting the job offer: ${error.message}`);
        console.error(`Error deleting job by ID: ${error.message}`);
        next();
      })
  },
};
