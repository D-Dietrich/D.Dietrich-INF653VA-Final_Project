const data = {
  states: require("../model/states.json") };
const statesMongo = require("../model/state");

//getStates - returns data for all states
const getStates = async (req, res) => {
  result = data.states;
  //Get value of contig
  const urlParams = new URLSearchParams(req.url);
   contig = urlParams.get('/?contig');
  //If contig is defined and is true, filter to only contigous states
  if (typeof contig !== 'undefined' && contig === 'true'){
    result = result.filter( sta => sta.code !== "AK" && sta.code !== "HI");
  }
    //If contig is defined and is false, filter to only non-contigous states
  if (typeof contig !== 'undefined' && contig === 'false'){
    result = result.filter( sta => sta.code === "AK" || sta.code === "HI");
  }
 //Merge state info with fun facts
    for (var i = 0; i < result.length; i++){
     state = await statesMongo.findOne({stateCode: result[i].code}).exec();
     facts = {};
      if(state){
        facts = {"funfacts": state.funfacts};
      }
      result[i] = {...result[i], ...facts};
  }
  res.json(result);

}; 


//getState - returns data for specified state
const getState = async (req, res) => {
  //If user did not provide code, return error message
  if(!req.params?.code){
      return res.status(400).json({message: 'State Code is required'});
    }
    //Convert code to uppercase
    const upperCode = (req.params.code).toUpperCase();
    
    result = data.states.find( 
      (sta) => sta.code === (upperCode)
      );
    if(!result) return res.status(400).json({message: `No State found matching ${upperCode}`});

     const state = await statesMongo.findOne({stateCode: upperCode}).exec();
        if(state){
          facts = {"funfacts": state.funfacts};
          result = {...result, ...facts};
        }
    
    res.json(result);
  
};


//getRandomFact - returns name and random fact from specified state
const getRandomFact = async (req, res) => {
  if (!req.params?.code){
    return res.status(400).json({message: 'State Code parameter is required'});
  }
  //Convert code to uppercase
  const upperCode = (req.params.code).toUpperCase();
  //Check if state code is valid
  const result = data.states.find(
    (sta) => sta.code === (upperCode)
    );
  if(!result) return res.status(400).json({message: `No State found matching ${req.param.code}`});

  const state = await  statesMongo.findOne({stateCode: upperCode}).exec();
//If no entry in MongoDB, infrom user that there are no fun facts for this state
try{  
if(!state || !state.funfacts || state.funfacts.length === 0){
      res.status(201).json({message: `No Fun Facts Available for ${upperCode}`})}
  //If entry exists and array exists, pick random fact and return it to user
  if (state.funfacts !== null && state.funfacts){
    randomFunfact = state.funfacts[Math.floor(Math.random()*state.funfacts.length)];
  res.status(201).json(randomFunfact);
  }
  
}
catch (error) {console.log(error)}
}; 


//getCaptial - returns name and capital of state
const getCaptial = async (req, res) => {
 if (!req.params?.code){
  return res.status(400).json({message: 'State Code parameter is required'});
}
//Convert code to uppercase
const upperCode = (req.params.code).toUpperCase();
//Check if state code is valid
const result = data.states.find(
  (sta) => sta.code === (upperCode)
  );
if(!result) return res.status(400).json({message: `No State found matching ${req.param.code}`});

res.json({
  "state": result.state,
  "capital": result.capital_city
});
};


//getNickname - returns name and nickname of state
const getNickname = async (req, res) => {
 if (!req.params?.code){
  return res.status(400).json({message: 'State Code parameter is required'});
}
//Convert code to uppercase
const upperCode = (req.params.code).toUpperCase();
//Check if state code is valid
const result = data.states.find(
  (sta) => sta.code === (upperCode)
  );
if(!result) return res.status(400).json({message: `No State found matching ${req.param.code}`});

res.json({
  "state": result.state,
  "nickname": result.nickname
});
};


//getPopulation - returns name and populations of state
const getPopulation = async (req, res) => {
  if (!req.params?.code){
    return res.status(400).json({message: 'State Code parameter is required'});
  }
  //Convert code to uppercase
  const upperCode = (req.params.code).toUpperCase();
  //Check if state code is valid
  const result = data.states.find(
    (sta) => sta.code === (upperCode)
    );
  if(!result) return res.status(400).json({message: `No State found matching ${req.param.code}`});

  res.json({
    "state": result.state,
    "population": result.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  });

};


//getAdmission - returns name and date of admission
const getAdmission = async (req, res) => {
  if (!req.params?.code){
    return res.status(400).json({message: 'State Code parameter is required'});
  }
  //Convert code to uppercase
  const upperCode = (req.params.code).toUpperCase();
  //Check if state code is valid
  const result = data.states.find(
    (sta) => sta.code === (upperCode)
    );
  if(!result) return res.status(400).json({message: `No State found matching ${req.param.code}`});

  res.json({
    "state": result.state,
    "admitted": result.admission_date
  });
};


//addFunFact - adds a fun fact to a specified state and returns all data for that state
const addFunFact = async (req, res) => {
if (!req.params?.code){
  return res.status(400).json({message: 'State Code parameter is required'});
}
if (!req.body.funfacts){
  return res.status(400).json({message: 'Fun Facts value required'});
}
//Convert code to uppercase
const upperCode = (req.params?.code).toUpperCase();

//Check if state code is valid
const result = data.states.find(
  (sta) => sta.code === (upperCode)
  );
if(!result) return res.status(400).json({message: `No State found matching ${req.param.code}`});
//If code is valid, check for entry in MongoDB
const state = await  statesMongo.findOne({stateCode: upperCode}).exec();
//If no entry in MongoDB, entry created and funfacts set to provided array
try{  
if(!state){
      const result = await statesMongo.create({
          stateCode: upperCode,
          funfacts: req.body.funfacts
      });
      res.status(201).json(result)}
  //If entry exists but does not have an array, array is added
  if (!state.funfacts){
    state.funfacts  = req.body.funfacts;
  const result = await state.save();
  res.json(result);
  }
  //If entry exists and array exists, concatinate arrays
  if (state.funfacts){
    state.funfacts  = state.funfacts.concat(req.body.funfacts);
  const result = await state.save();
  res.json(result);
  }
  return res.status(400).json({message: 'Unable to add fun facts'});
}
catch (error) {console.log(error)}
}; 


//updateFunFact - updates fun fact for state and returns data for that state
const updateFunFact = async (req, res) => {
  if (!req.params?.code){
    return res.status(400).json({message: 'State Code parameter is required'});
  }
  if (!req.body.funfact){
    return res.status(400).json({message: 'funfact property required'});
  }
  if (!req.body.index){
    return res.status(400).json({message: 'index property required'});
  }
  //Convert code to uppercase
  const upperCode = (req.params?.code).toUpperCase();
  
  //Check if state code is valid
  const result = data.states.find(
    (sta) => sta.code === (upperCode)
    );
  if(!result) return res.status(400).json({message: `No State found matching ${upperCode}`});
  //If code is valid, check for entry in MongoDB
  const state = await  statesMongo.findOne({stateCode: upperCode}).exec();
  //If there is no funfacts entry to edit, return messsage
  if(!state || ! state.funfacts) return res.status(404).json({message: `No Fun Facts entry for ${state.state}. Unable to update Fun Facts.`});

  //Check if index is valid
  if(!state.funfacts[(req.body.index-1)]) return res.status(404).json({message: `Invalid index. ${req.body.index} does not exist for ${state.state}.`});

  //If all components are valid, update fun facts for given state with new fun fact at given index
  state.funfacts[(req.body.index-1)] = req.body.funfact;
    const updatedState = await state.save();
  
    res.json(updatedState);

};


//deleteFunFact - deletes un fact for a state and returns data for that state
const deleteFunFact = async (req, res) => {
  
  if (!req.params?.code){
    return res.status(400).json({message: 'State Code parameter is required'});
  }
  if (!req.body.index){
    return res.status(400).json({message: 'index property required'});
  }
  //Convert code to uppercase
  const upperCode = (req.params?.code).toUpperCase();
  
  //Check if state code is valid
  const result = data.states.find(
    (sta) => sta.code === (upperCode)
    );
  if(!result) return res.status(400).json({message: `No State found matching ${upperCode}`});
  //If code is valid, check for entry in MongoDB
  const state = await  statesMongo.findOne({stateCode: upperCode}).exec();
  //If there is no funfacts entry to edit, return messsage
  if(!state || ! state.funfacts) return res.status(404).json({message: `No Fun Facts entry for ${state.state}. Unable to update Fun Facts.`});

  //Check if index is valid
  if(!state.funfacts[(req.body.index-1)]) return res.status(400).json({message: `Invalid index. ${req.body.index} does not exist for ${state.state}.`});

  //If all components are valid, update fun facts for given state with new fun fact at given index
  state.funfacts.splice((req.body.index-1), 1);
    const updatedState = await state.save();
  
    res.json(updatedState);

};


module.exports = {
   getStates,
   getState,
   getRandomFact,
   getCaptial,
   getNickname,
   getPopulation,
   getAdmission,
   addFunFact,
   updateFunFact,
   deleteFunFact
}