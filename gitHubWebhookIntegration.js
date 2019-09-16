let jiraTransition = require('./jiraStateTransition');
let gitHubWrapper = require('./jiraStatusIdentification.js');
let jiraWrapper = require('./jiraStateTransition.js');
let jiraListFromCommit = require('./getJIRAListFromCommit.js');


let jiraNumber, branchName, commentMessage;
let devBranches = [];
let jiraList = [];

module.exports.HandleNotifications = async (event, context) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  const errorResponse = {
    statusCode: 500,
    body: JSON.stringify('Error in the response'),
  };
  let jiraNumber, branchName, commentMessage;
  console.log('body : ' + event.body);
  var json = JSON.parse(event.body);
  console.log('After parsing : ' + json);
  return gitHubWrapper.getGitHubOperation(json)
    .then(operation => {
      switch (operation) {
        case 'FeatureBranchCreated': {
          branchName = json.ref.split('/'); //json.branches[0].name.split
          if (branchName[0].startsWith('SF-')) // JIEA number format is : SF-XXXX hence we are filtering with this value
		  {
            jiraNumber = branchName[0];
            console.log('--------------------------------------------------------------------------------');
            console.log('***** New Feature Branch is created *****');
            console.log('Name of the Feature Branch ' + json.ref);
            console.log('Jira status to be changed from TODO to Inprogress for :' + jiraNumber);
            console.log('--------------------------------------------------------------------------------');
            commentMessage = 'Automated process : New feature branch is created with branch name : ' + json.ref;
            // calling the function to update the Jira status from TODO to Inprogress
            jiraWrapper.updateJiraStatus(jiraNumber, 21, commentMessage).then(success => {
              console.log(success);
              return response;
            },
              error => {
                console.log(error);
              });
          }
        }
          break;

        case 'PullRequestValidated': {
          branchName = json.branches[0].name;
          jiraNumber = branchName.split('/');
          if (jiraNumber[0].startsWith('SF-'))
          {
            console.log('--------------------------------------------------------------------------------');
            console.log('***** Pull reqest has been raised ***** ');
            console.log('Jira that would be moved to review :' + jiraNumber[0]);
            console.log('--------------------------------------------------------------------------------')
            commentMessage = 'Automated process : Completed development for Jira :' + jiraNumber[0] + ' and sent it for review';
            jiraWrapper.updateJiraStatus(jiraNumber[0], 31, commentMessage).then(success => {
              console.log(success);
              return response;
            },
              error => {
                console.log(error);
              });
            jiraWrapper.updateAssignee(jiraNumber[0]).then(success => {
              console.log(success);
              return response;
            },
              error => {
                console.log(error);
              });
          }
        }
          break;
        case 'PullRequestMergedToDevelopment': {
          branchName = json.pull_request.head.ref;
          var merged_to = json.pull_request.base.ref;
          jiraNumber = branchName.split('/');
          if (jiraNumber[0].startsWith('SF-')) //  Development value needs to be changed to dev
          {
            console.log('--------------------------------------------------------------------------------');
            console.log('***** Pull request has been reviewed and merged  *****');
            console.log('Merged to :' + merged_to);
            console.log('Jira that is ready to move to QA : ' + jiraNumber[0] + ' from branch: ' + branchName + ' To ' + merged_to + ' branch');
            console.log('--------------------------------------------------------------------------------');
            jiraList = jiraNumber[0];
            commentMessage = 'Automated process : Development is completed and code has been reviewed, moving it to Ready for QA ';
            // Once dev is merged to realease branch, need to pass the devBranches array and change the status is bulk
            jiraWrapper.updateJiraStatus(jiraNumber[0], 41, commentMessage).then(success => {
              console.log(success);
              return response;
            },
              error => {
                console.log(error);
              });
          }
        }
          break;
        case 'PullRequestMergedToRelease':
          {
            branchName = json.pull_request.head.ref;
            var merged_to_branch = json.pull_request.base.ref;
            console.log('--------------------------------------------------------------------------------');
            console.log('***** Development Branch has been merged to QA  *****');
            console.log('Merged to :' + merged_to_branch + 'from : ' + branchName);
            console.log('--------------------------------------------------------------------------------');
            commentMessage = 'Automated process : Code has been deployed to QA - Functionality is ready to be tested';
            for (var j = 0; j < jiraList.length; j++) {
              //   jiraTransition.updateJiraStatus(jiraList[i], 51, commentMessage); //51--> QA Testing
              console.log('List of Jira moved QA are : ' + jiraList);
            }
          }
          break;
        case 'PullRequestMergedToMaster':
          {
            branchName = json.pull_request.head.ref;
            var mergedToBranch = json.pull_request.base.ref;
            var pullReqID = json.number;
            var result = [];
            result = jiraListFromCommit.getJIRAListFromCommit(pullReqID);
            if (result.var2 == 'Deployed') {
              result.var1.forEach(function (jiraList) {
                console.log('--------------------------------------------------------------------------------');
                console.log('***** Stage Branch has been merged to Production  *****');
                console.log('Merged to :' + mergedToBranch + 'from : ' + branchName);
                console.log('--------------------------------------------------------------------------------');
                commentMessage = 'Code has been deplyed to Production';
                jiraTransition.updateJiraStatus(jiraList, 131, commentMessage).then(success => {
                  console.log(success);
                  return response;
                },
                  error => {
                    console.log(error);
                  });
              })
            }
          }
          break;
      }
      return response;
    },
      error => {
        return errorResponse;
      });
};