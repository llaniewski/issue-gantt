var ig_repo_user = "";
var ig_repo_name = "";
var ig_repo_issues = null;

var ig_start_regex = /([Gg]antt[Ss]tart|[Ss]tart[Dd]ate)\s*:\s*([^\s]*)/;
var ig_start_tag = "StartDate";
var ig_end_regex = /([Gg]antt[Ee]nd|[Gg]antt[Dd]ue|[Ee]nd[Dd]ate|[Dd]ue[Dd]ate)\s*:\s*([^\s]*)/;
var ig_end_tag = "EndDate";
var ig_dep_regex = /([Dd]epends)\s*:\s*([^\s]*)/;
var ig_dep_tag = "Depends";

function iq_update_ibody(ibody, regex, tag, value) {
	var found = ibody.search(regex) >= 0;
	if(found){
		return ibody.replace(regex, "$1: " + value);
	} else {
		return ibody + "\n" + tag + ": " + value;
	}
}

function iq_task_date_change(task, start, end) {
	console.log(task, start, end);
	if (ig_repo_issues) {
		ibody = task.body;
		ibody = iq_update_ibody(ibody, ig_start_regex, ig_start_tag, start.toISOString());
		ibody = iq_update_ibody(ibody,   ig_end_regex,   ig_end_tag,   end.toISOString());
		console.log(ibody);
		if (ibody != task.body) {
			ig_repo_issues.editIssue(task.issue_number, {body:ibody}, function(err, issue) {
				if (! err) {
					console.log(issue);
				} else {
					console.log(err);
				}
			});
	
		}
/*
		ig_repo_issues.listIssueComments(task.issue_number, function(err, comments) {
			if (! err) {
				console.log(comments);
			} else {
				console.log(err);
			}
		});
*/

	}
}

function iq_task_html(task) {
	return task.body_html;
}

function iq_create_gantt(tasks) {
	var gantt_chart = new Gantt(".gantt-target", tasks, {
		on_click: function (task) {
			console.log(task);
		},
		on_date_change: iq_task_date_change,
		custom_popup_html: iq_task_html,
		on_progress_change: function(task, progress) {
			console.log(task, progress);
		},
		on_view_change: function(mode) {
			console.log(mode);
		},
		view_mode: 'Month',
		language: 'en',
		draggable: true
	});
}

function ig_get_repo_name() {
	const urlobj = new URL($(location).attr("href"));
	path = urlobj.pathname.split("/");
	if (path.length < 3) return;
	if (path[1] != "repo") return;
	if (path[2] == "") return
	if (path[3] == "") return
	ig_repo_user = path[2];
	ig_repo_name = path[3];
	$(".logo__text").text("ls " + ig_repo_user + "/" + ig_repo_name + "/tasks");
}

function ig_create_task(issue) {
	title = issue.title;
	startdate = issue.created_at;
	enddate = issue.updated_at;
	number = issue.number;
	dependencies = "";
	ibody = issue.body;
	m = ibody.match(ig_start_regex);
	if (m) if (m[2]) startdate = m[2];
	m = ibody.match(ig_end_regex);
	if (m) if (m[2]) enddate = m[2];
	m = ibody.match(ig_dep_regex);
	if (m) if (m[2]) dependencies =  m[2];
	return {
		name: title,
		start: startdate,
		end: enddate,
		issue_number: number,
		id: "#" + number,
		dependencies: dependencies,
		progress: 0,
		body: ibody,
		body_html: issue.body_html,
		title: title,
		draggable: true
	}
}

function ig_get_issues() {
	if (ig_gh_token) {
		ig_get_repo_name();
		var gh = new GitHub({
			token: ig_gh_token
		});
		if (ig_repo_name) {
			ig_repo_issues = gh.getIssues(ig_repo_user, ig_repo_name);
			console.log(ig_repo_issues);
			ig_repo_issues.listIssues({per_page: 100, pulls: false, state: "open", AcceptHeader: "full"}, function(err, issues) {
				if (! err) {
					console.log(issues);
					tasks = $.map(issues, ig_create_task)
					tasks.sort((a,b) => a.start.localeCompare(b.start));
					console.log(tasks);
					iq_create_gantt(tasks);
				} else {
					console.log(err);
				}
			});
		}
	}    
}

$(function() { ig_get_issues(); });
