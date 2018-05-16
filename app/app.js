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
  'Do any data subjects you are collecting data from, including your employees, reside in the European Economic Area or European Union?',
  'Is your organisation aware of what personal data means under the GDPR?',
  'Have you assessed the impact of the new definition of consent under the GDPR and how this affects your surveys?',
  'Do you have a process for breach notification?',
  'Have you given the data subject the right to access his or her information?',
  'Where a data subject has asked for his or her information, is the information given in a commonly useable and machine readable format?',
  'Does your organisation have the process of erasing the subject’s data at his/her request?',
  'Does your organisation hold and process data only if it is absolutely necessary for the completion of its duties?',
  'Have you trained your staff on the GDPR and how to properly handle data?',
  'Have you considered if you need to appoint a Data Protection Officer (DPO)?'

]

const answers_descriptions = [
  'If you are collecting data from citizens or employees that reside in European Economic Area then GDPR applies to you, even if you are based in a country outside the European Union.',
  'The GDPR\'s definition of personal data is <break time="0.5s"/> Any information relating to an identified or identifiable natural person.',
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
    let speech = 'Hi, I am GDPR Assistant, I will be asking a few questions related to data <break time="0.5s"/>' +
        'In case a you didn\'t understood the question, say repeat' +
        '<break time="0.5s"/> Are you ready?'
    let rePrompt = 'Are you ready?'
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
      let responses = ['Great!', 'Amazing!', 'Awesome!']
      this.toStatelessIntent('QuestionsIntent', {
        yes: responses[Math.floor(Math.random() * responses.length)]
      })
    },
    'NoIntent': function() {
      let answers = this.getSessionAttribute('answers');
      answers.push(0);
      this.setSessionAttribute('answers', answers)
      // if user has no EU data
      if (answers.length === 1) {
        this.toStatelessIntent('END', 'Excellent, you don\'t need to worry about GDPR as of now');
      }
      let speech = answers_descriptions[answers.length - 1];
      //this.tell(speech);
      this.toStatelessIntent('QuestionsIntent', {no: speech})
    },
    'Unhandled': function() {
      // Triggered when the requested intent could not be found in the handlers variable
      this.tell('Unhandled')
    }
  },
  'QuestionsIntent': function(data) {
    const count = this.getSessionAttribute('answers').length
    if (count === questions.length) {
      this.toIntent('ResultIntent')
      return
    }
    let speech = ''
    if (data && data.yes && count > 0) {
      speech = data.yes +
          '<break time="0.5s"/> Next Question, <break time="0.5s"/>' +
          questions[count]
    } else if (data && data.no) {
      speech = data.no +
          '<break time="1s"/>Next Question, <break time="0.5s"/>' +
          questions[count]
    } else if (data && data.repeat) {
      speech = 'Repeating the question, <break strength="weak"/>' +
          questions[count]
    } else {
      speech = questions[count]
    }
    this.followUpState('ResponseState').ask(speech, questions[count])
  },
  'Unhandled': function() {
    this.tell('Something went wrong, please start from beginning')
    this.toIntent('NEW_SESSION');
  },
  'ResultIntent': function(){
    const result = {
      'poor': 'You probably need to find out a bit more about the GDPR! All businesses must comply if they collect or store personal data.',
      'average': 'You are somewhat prepared for the GDPR, but you still have some issues that you need to consider.',
      'good': 'That’s great, it looks like you are well on your way to being GDPR compliant. But you should look at the points where you are still lacking.',
      'best': 'Congratulations, you seem to have a good grasp of the main changes that GDPR will bring.'
    }
    // calculating final result
    let answers = this.getSessionAttribute('answers')
    let right = 0
    for (let i = 0; i < answers.length; i++) {
      if (answers[i]) {
        right++
      }
    }
    let percentage = (right / answers.length * 100);

    let speech = 'You have scored ' + percentage + ' percentage,<break time="0.5s"/> '

    if (percentage >= 80) {
      speech += result['best']
    } else if (percentage >= 60) {
      speech += result['good']
    } else if (percentage >= 40) {
      speech += result['average']
    } else {
      speech += result['poor']
    }
    speech +=' .Thank you for trying'
    this.tell(speech);
  },
  'END': function(data) {
    let speech = (data ? data: '') + 'Thank you for trying';
    this.tell(speech);
  }
})

module.exports.app = app
