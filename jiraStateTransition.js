var request = require('request');
module.exports.updateJiraStatus = (jiraNumber, status_ID, comment_message) => {
	return new Promise((resolve, reject) => {
		console.log("Inside the updateJirastus Service");
		console.log('JiiraNumber=' + jiraNumber + ' Status_ID=' + status_ID + ' Comment_Message=' + comment_message);
		let form = {
			"update": {
				"comment": [
					{
						"add": {
							"body": comment_message
						}
					}
				]
			},
			"transition": {
				"id": status_ID
			}
		}
		console.log("About to execute");
		request({
			'headers': {
				'Authorization': 'Basic xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
				'user-agent': 'node.js',
				'Content-Type': 'application/json'
			},
			'uri': 'http://jira.ef.com/rest/api/2/issue/' + jiraNumber + '/transitions',
			'method': 'POST',
			'json': form
		},
			function (err, res, body) {
				console.log('Error returned : ' + err);
				console.log('Res returned : ' + res);
				console.log('Body returned : ' + body);
				if (err) {
					console.log('Error returned : ' + err);
					reject(err);
				}
				else {
					console.log('Body =' + body);
					console.log('Updated the Jira Status successfully');
					// ID - 11 --> On Hold 
					// ID - 21 --> In Progress
					// ID - 31 --> Review
					// ID - 41 --> Ready for QA
					// ID - 51 --> QA Testing 
					// ID - 71 --> Done
					// ID - 81 --> Invalid
					// ID - 111 --> To Do
					// ID - 131 --> Ready for Live
					// ID - 241 --> Technical Specification
					// ID - 251 --> Business Specification
					resolve("success");
				}
			});
	});
}

module.exports.updateAssignee = (jiraNumber) => {
	return new Promise((resolve, reject) => {
		let formdata = {
			'name': 'ext.adam.siwek'
		}
		request({
			'headers': {
				'Authorization': 'Basic xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
				'User-Agent': 'node.js',
				'Content-Type': 'application/json'
			},
			'uri': 'http://jira.ef.com/rest/api/2/issue/' + jiraNumber + '/assignee',
			'method': 'PUT',
			'json': formdata
		},
			function (err, res, body) {
				if (err) {
					console.log('Error returned : ' + err);
					reject(err);
				}
				else {
					console.log(body);
					resolve("Success");
				}
			});
	});
}

module.exports.getCheckStatus = (sha) => {
	console.log('Inside getCheckStatus : ' + sha);
	return new Promise((resolve, reject) => {
		request({
			'headers': {
				'Authorization': 'token xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
				'X-GitHub-Media-Type': 'application/vnd.github.symmetra-preview+json',
				'user-agent': 'node.js'
			},
			'uri': 'https://api.github.com/repos/ILC-Technology/Salesforce/commits/' + sha + '/status',
			'method': 'GET',
		},
			function (err, res, body) {
				if (err) {
					console.log('Error returned : ' + err);
					reject(err);
				}
				else {
					console.log('Status returned : ' + body);
					const jsonBody = JSON.parse(body);
					console.log('JsonBody :' + jsonBody.state);
					console.log('State=' + (jsonBody.state == "success"));
					resolve(jsonBody.state == "success");
				}
			});
	});
}

module.exports.updateJiraFixversions = (jiraNumber, fixversion) => {
	return new Promise((resolve, reject) => {
		console.log("Inside the updateJirastus fixversion service");
		let form =
		{
			"update": {
				"fixVersions": [
					{
						"set": [
							{
								"name": fixversion
							}
						]
					}
				]
			}
		}
		console.log("About to execute");
		request({
			'headers': {
				'Authorization': 'Basic xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
				'user-agent': 'node.js',
				'Content-Type': 'application/json'
			},
			'uri': 'http://jira.ef.com/rest/api/2/issue/' + jiraNumber,
			'method': 'POST',
			'json': form
		},
			function (err, res, body) {
				if (err) {
					console.log('Error returned : ' + err);
					reject(err);
				}
				else {
					console.log('Body =' + body);
					console.log('Updated the fix version');
					resolve("success");
				}
			});
	});
}