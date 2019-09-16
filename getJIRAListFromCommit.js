var request = require('request');
var deploymentLabel = "";
const listNstatus;

module.exports.getJIRAListFromCommit = (pullRequestId) => {
	listNstatus = getPullRequestDetails(pullRequestId);
	return listNstatus;
}

function getPullRequestDetails(pullRequestId) {
	request({
		'headers': {
			'Authorization': 'token xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
			'X-GitHub-Media-Type': 'application/vnd.github.symmetra-preview+json',
			'user-agent': 'node.js'
		},
		'uri': 'https://api.github.com/repos/YourRepository/ProjectName/pulls/' + pullRequestId,
		'method': 'GET'
	}, function (err, res, body) {
		var jsonData = JSON.parse(body);
		deploymentLabel = (JSON.stringify(jsonData.labels[0].name));
		var headSha = jsonData.head.sha;
		var commitList = [];
		commitList = recursivelyGetCommitList(jsonData, headSha, commitList);
		console.log("Inside getPullRequestDetails method :" + commitList);
		return commitList;
	});
}

function recursivelyGetCommitList(pullRequest, headSha, commitList) {
	request({
		'headers': {
			'Authorization': 'token xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
			'X-GitHub-Media-Type': 'application/vnd.github.symmetra-preview+json',
			'user-agent': 'node.js'
		},
		'uri': 'https://api.github.com/repos/YourRepository/ProjectName/compare/' + pullRequest.base.sha + '...' + headSha,
		'method': 'GET'
	}, function (err, res, body) {
		var jsonData = JSON.parse(body);
		jsonData.commits.forEach(function (commit) {
			commitList.push(commit);
		})
		if (jsonData.commits.length == 250) {
			recursivelyGetCommitList(pullRequest, jsonData.commits[0].sha, commitList);
		}
		else {
			var jiraList = [];
			commitList.forEach(function (commit) {
				if ((commit.commit.message).startsWith('Merge pull request')
					&& commit.commit.message.includes('from')
					&& (commit.commit.message != null)) {
					var subString = (commit.commit.message).split('from')[1];
					var subStrings = subString.split('/');
					if (subStrings != null &&
						subStrings.length == 3 &&
						subStrings[1].includes('SF-') &&
						!jiraList.includes(subStrings[1])) {
						jiraList.push(subStrings[1]);
					}
				}
			});
			return {
				"var1": JSON.stringify(jiraList),
				"var2": JSON.stringify(deploymentLabel)
			};
		}

	});
}
