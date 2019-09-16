var request = require('request');
let jiraWrapper = require('./jiraStateTransition.js');

module.exports.getGitHubOperation = (eventBody) => {
    try {
        console.log('getGitHubOperation : ' + eventBody);
        return new Promise((resolve, reject) => {
            try {
                console.log('Inside try : ' + eventBody);
                if (eventBody.master_branch != null && eventBody.master_branch === 'develop'
                    && eventBody.ref != null && eventBody.repository.id != null
                    && eventBody.ref_type != null) {
                    resolve('FeatureBranchCreated');
                }
                else if (eventBody.id && eventBody.state
                    && eventBody.state === 'success'
                    && ((eventBody.description).includes("successful") ||
                        (eventBody.description).includes("This commit looks good"))
                ) {
                    console.log('Inside else if : ' + eventBody);
                    jiraWrapper.getCheckStatus(eventBody.sha)
                        .then(status => {
                            if (status == true)
                                resolve('PullRequestValidated');
                        });
                }
                else if (eventBody.action == 'closed' && eventBody.number
                    && (eventBody.pull_request.state == 'closed')
                    && eventBody.pull_request.base.ref == 'develop') {
                    resolve('PullRequestMergedToDevelopment');
                }
                 else if (eventBody.action == 'closed' && eventBody.number
                     && (eventBody.pull_request.state == 'closed')
                     && eventBody.pull_request.head.ref == 'develop'
                     && (eventBody.pull_request.base).startsWith('release')) {
                     resolve('PullRequestMergedToRelease');
                 }
                 else if ((eventBody.action == 'closed' && eventBody.number
                     && (eventBody.pull_request.state == 'closed')
                     && (eventBody.pull_request.head.ref).startsWith('stage')
                     && eventBody.pull_request.base.ref == 'master')) {
                     resolve('PullRequestMergedToMaster');
                }
                console.log('No match : ');
            }
            catch (e) {
                console.log('Inside catch : ' + e);
                reject(e);
            }
        });
    }
    catch (Exception) {
        var status = 'Error';
        console.log(status);
    }
}
