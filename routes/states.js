const express = require("express");
const router = express();
const stateController = require("../controllers/stateController");

router.route('/:code/funfact')
.get(stateController.getRandomFact)
.post(stateController.addFunFact)
.patch(stateController.updateFunFact)
.delete(stateController.deleteFunFact);

router.route('/:code/capital')
.get(stateController.getCaptial);

router.route('/:code/nickname')
.get(stateController.getNickname);

router.route('/:code/population')
.get(stateController.getPopulation);

router.route('/:code/admission')
.get(stateController.getAdmission);

router.route('/:code')
.get(stateController.getState);


router.route("/")
.get(stateController.getStates);

module.exports = router;
