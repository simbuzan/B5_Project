const Candidate = require("../models/candidate");
const User = require("../models/user");
const app = require("express")();

module.exports = {
  // index: (req, res, next) => {
  //   Candidate.find({})
  //     .exec()
  //     .then((candidates) => {
  //       res.locals.candidates = candidates;
  //       next();
  //     })
  //     .catch((error) => {
  //       console.log(`Error fetching candidates: ${error.message}`);
  //       return [];
  //     })
  //     .then(() => {
  //       console.log("promise complete");
  //     });
  // },

  // indexView: (req, res) => {
  //   res.render("candidates/index");
  // },

  // new: (req, res) => {
  //   res.render("candidates/new");
  // },

  // create: (req, res, next) => {
  //   let candidateParams = {
  //     preferred_position: req.body.preferred_position,
  //     soft_skills: req.body.soft_skills,
  //     other_aspects: req.body.other_aspects,
  //     work_culture_preferences: req.body.work_culture_preferences,
  //   }
  //   Candidate.create(candidateParams)
  //     .then(candidate => {
  //       req.flash('success', `${candidate.preferred_position} candidate created successfully!`);
  //       res.locals.redirect = '/candidates';
  //       res.locals.candidate = candidate;
  //       next();
  //     })
  //     .catch(error => {
  //       console.log(`Error saving candidate profile: ${error.message}`);
  //       res.locals.redirect = "/candidates/new";
  //       req.flash(
  //         "error",
  //         `Failed to create user account because: ${error.message}.`
  //       );
  //       next();
  //     });
  // },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  // show: (req, res, next) => {
  //   let candidateId = req.params.id;
  //   Candidate.findById(candidateId).then(candidate => {
  //     res.locals.candidate = candidate;
  //     next();
  //   })
  //     .catch(error => {
  //       console.log(`Error fetching candidate by ID: ${error.message}`);
  //       next(error);
  //     });
  // },

  // showView: (req, res) => {
  //   res.render('candidates/show');
  // },
  edit: (req, res, next) => {

    let candidateId = req.params.id;
    Candidate.findById(candidateId).then(candidate => {
      res.render("candidates/edit",
        {
          candidate: candidate
        });
    })
      .catch(error => {
        console.log(`Error fetching user by ID: ${error.message}`);
        next(error);
      });
  },

  //UPDATE (WORKS)
  update: (req,res,next) => {
    let candidateId = req.params.id;
    let work_culture_preferences = candidateId.work_culture_preferences;
    let work_culture_preferences_params = {
      name: work_culture_preferences.name,
      importance: work_culture_preferences.importance,
    };

    let candidateParams = {
      preferred_position: req.body.preferred_position,
      soft_skills: req.body.soft_skills,
      other_aspects: req.body.other_aspects,
      work_culture_preferences: work_culture_preferences_params
      // work_culture_preferences: req.body.work_culture_preferences,
    };

    Candidate.findByIdAndUpdate(candidateId, { $set: candidateParams })
      .then(candidate => {
        res.locals.redirect = `/user/${req.app.locals.user._id}`;
        res.locals.candidate = candidate;
        next();
      })
      .catch(error => {
        console.log(`Error updating candidate by ID: ${error.message}`);
        next(error);
      });
  },


  // delete: (req, res, next) => {
  //   let candidateId = req.params.id;
  //   Candidate.findByIdAndRemove(candidateId)
  //     .then(() => {
  //       res.locals.redirect = "/candidates";
  //       next();
  //     })
  //     .catch(error => {
  //       console.log(`Error deleting candidate by ID: ${error.message}`);
  //       next();
  //     })
  // },
}

