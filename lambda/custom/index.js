/* eslint-disable  func-names */
/* eslint-disable  no-console */

const AWS = require('aws-sdk');
const Alexa = require('ask-sdk-core');
const moment = require('moment');

const { getDramas }  = require('./db');
const { launchText } = require('./text');

const tableName = process.env.SRC_DDB;
const todayDate = moment().format('YYYY/MM/DD');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;

    const requestAttributes = attributesManager.getRequestAttributes();
    const speechOutput = `<speak>${launchText}</speak>`;
    return responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
  },
};

const PreferencesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PreferencesIntent';
  },
  handle(handlerInput) {
    console.log('Preferences Intent Handler', handlerInput.requestEnvelope.request);
    const speechText = 'Which genre do you like more?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('KFever', speechText)
      .getResponse();
  },
};

const GenreIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GenreIntent';
  },
  handle(handlerInput) {
    console.log('Genre Intent Handler', handlerInput.requestEnvelope.request);
    let dsrc = handlerInput.requestEnvelope.request.intent.slots.DramaGenre;
    const speechText = 'Great! Let me your prefered genre as';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('KFever', speechText)
      .getResponse();
  },
};

const ListDramasIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ListDramasIntent';
  },
  handle(handlerInput) {
    let dsrc = handlerInput.requestEnvelope.request.intent.slots.DramaSource;
    console.log('List Dramas Intent Handler', dsrc);
    if(dsrc.value) {
      dsrc = dsrc.value.toLowerCase();
    } else {
      dsrc = 'dramafever';
    }
    return getDramas(tableName,`${dsrc}-dramas`,todayDate)
      .then((data)=>{
        if(data.Items && data.Items.length > 0) {
          const dlist = data.Items[0].list.join(', <break time="600ms" />');
          const speechText = `<speak>Here are some of the available dramas on ${dsrc}.<break time="1000ms" />${dlist}</speak>`;
          console.log('Hola Pithre!', dlist);
          return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('KFever', speechText)
            .getResponse();
        } else {
          const speechText = `<speak>No dramas found on ${dsrc}.</speak>`;
          return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('KFever', speechText)
            .getResponse();
        }

      })
      .catch(err =>console.log('DB  Fetch Error:', err));
    // <audio src="https://s3.amazonaws.com/kfever/SoGoodbye-90s.mp3" />
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('KFever', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('KFever', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    console.log(handlerInput.requestEnvelope.request);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    ListDramasIntentHandler,
    PreferencesIntentHandler,
    GenreIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
