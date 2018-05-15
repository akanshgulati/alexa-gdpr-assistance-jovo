'use strict'

// =================================================================================
// App Configuration
// =================================================================================

const {App} = require('jovo-framework')

const config = {
  logging: true,
  intentMap: {
    'AMAZON.YesIntent': 'YesIntent',
    'AMAZON.NoIntent': 'NoIntent',
  }
}

const app = new App(config)

const questions = [
  'Do any data subjects you are collecting data from, including your employees, reside in the EEA/EU?',
  'Is your organisation aware of what personal data means under the GDPR?',
  'Have you assessed the impact of the new definition of consent under the GDPR and how this affects your surveys',
  'Do you have a process for breach notification?',
  'Have you given the data subject the right to access his or her information?',
  'Where a data subject has asked for his or her information, is the information given in a commonly useable and machine readable format?',
  'Does your organisation have the process of erasing the subject’s data at his/her request?',
  'Does your organisation hold and process data only if it is absolutely necessary for the completion of its duties?',
  'Have you trained your staff on the GDPR and how to properly handle data',
  'Have you considered if you need to appoint a Data Protection Officer (DPO)'

]

const answers_descriptions = [
  'If you are collecting data from citizens or employees that reside in EEA then GDPR applies to you, even if you are based in a country outside the EU.',
  'The GDPR\'s definition of personal data is ‘any information relating to an identified or identifiable natural person’. There is, however, a wide interpretation - it could mean a nickname, an ID number, an IP address or other indirect identification.',
  'GDPR’s revised approach means you must have clear documentation that the audience is happy for you to email them. And remember, you will need to obtain new consent from any current contacts in your database as well.',
  'There will be a duty for all organisations to report certain types of data breaches and, in some cases, inform the individuals affected by the breach as well.',
  'Individuals must have the right to access any personal data that you store about them and this must be provided free of charge.',
  'When asked, you must use “reasonable means” to supply the information. For example, if the request is made electronically, you should provide the information in a commonly used electronic format.',
  'Make sure you have a process in place for when an individual asks you to delete their personal data',
  'GDPR will introduce the concept of ‘privacy by design\' and by default to encourage organisations to consider data protection throughout the entire life cycle of any process',
  'The majority of data breaches occur because of human error. You must provide evidences to understand the risk and run awareness trainings',
  'For many businesses, it will be mandatory to appoint a DPO, for instance if your core activity involves the regular monitoring of individuals on a large scale'
]
// =================================================================================
// App Logic
// =================================================================================

app.setHandler({
  'NEW_SESSION': function() {
    let speech = 'Hi, I am GDPR Assistant. I will be asking a few questions to give you ' +
        'a final score out of 10. Are you ready?';
    let rePrompt = 'are you ready to start the quiz?'
    this.setSessionAttribute('answers', []);
    this.followUpState('StartQuizState').ask(speech, rePrompt);
  },
  'StartQuizState': {
    'YesIntent': function(){
      this.toIntent('QuestionsIntent')
    },
    'NO': function() {
      this.toStatelessIntent('END')
    }
  },
  'ResponseState': {
    'YesIntent': function(){
      let answers = this.getSessionAttribute('answers');
      answers.push(1);
      this.setSessionAttribute('answers', answers)
      let responses = ['Great!', 'Amazing!', 'Awesome']
      this.toStatelessIntent('QuestionsIntent',
          responses[Math.floor(Math.random() * responses.length)])
    },
    'NoIntent': function() {
      let answers = this.getSessionAttribute('answers');
      answers.push(0);
      this.setSessionAttribute('answers', answers)
      let speech = answers_descriptions[answers.length - 1];
      //this.tell(speech);
      this.toStatelessIntent('QuestionsIntent', speech)
    }
  },
  'QuestionsIntent': function(data) {
    const count = this.getSessionAttribute('answers').length
    if (count === questions.length) {
      console.log('Log: END')
      this.toIntent('END')
      return
    }
    let question = (data ? data + '<break time="1s"/> Next Question, <break time="0.5s"/>' : count > 0
        ? ' Next Question,  '
        : '') + questions[count];
    this.followUpState('ResponseState').ask(question, questions[count])
  },
  'Unhandled': function() {
    this.tell('Something went wrong, please start from beginning')
    this.toIntent('NEW_SESSION');
  },
  'END': function() {
    let answers = this.getSessionAttribute('answers')
    let right = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i]) {
        right++
      }
    }
    let percentage = (right / answers.length * 100);
    const percentage_responses = ['pretty good, you\'re ready for GDPR', 'pretty bad, please re-work on the points mentioned']
    let speech = 'You have scored ' + percentage +
    ' percentage score which is ' + (percentage >= 50
        ? percentage_responses[0]
        : percentage_responses[1]);
    this.tell(speech);
  }
})

module.exports.app = app
/*
'EnterDoorIntent': function(color) {
  let speech = ''
  let reprompt = ''

  if (color.value === 'blue') {
    speech = 'You chose to go through the blue door.'
        + ' There is a dark, long floor. Suddenly, you hear a sound from a room at the end of it.'
        + ' Do you want to follow the sound?'
    reprompt = 'Please say yes or no.'
    this.followUpState('BlueDoorState').ask(speech, reprompt)
  } else if (color.value === 'red') {
    speech = 'You chose to go through the red door.'
        +
        ' You find yourself in a small room with only one door, and a dog sleeping in front of it.'
        +
        ' To go through it, you would have to wake up the dog. Do you want to do it?'
    reprompt = 'Please say yes or no.'
    this.followUpState('RedDoorState').ask(speech, reprompt)
  } else {
    speech = 'Please choose either the blue door or the red door.'
    reprompt = 'Say blue door, or red door.'
    this.ask(speech, reprompt)
  }
},
'BlueDoorState': {
  'YesIntent': function() {
    let speech = 'Blue Door: You chose Yes!';
    this.tell(speech);
  },

  'NoIntent': function() {
    let speech = 'Blue Door: You chose No!';
    this.tell(speech);
  },
  'Unhandled': function() {
    let speech = 'You have choose either yes or no. Please choose again'
    this.followUpState('BlueDoorState').ask(speech)
  }
},
'RedDoorState': {
  'YesIntent': function() {
    let speech = 'Red Door: You chose Yes!';
    this.tell(speech);
  },

  'NoIntent': function() {
    let speech = 'Red Door: You chose No!';
    this.tell(speech);
  },
  'Unhandled': function(){
    let speech = 'You have choose either yes or no. Please choose again';
    this.followUpState('RedDoorState').ask(speech)
  }
},*/
