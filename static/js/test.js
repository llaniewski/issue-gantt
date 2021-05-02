


function iq_create_gantt(tasks) {
	var gantt_chart = new Gantt(".gantt-target", tasks, {
		on_click: function (task) {
			console.log(task);
		},
		on_date_change: function(task, start, end) {
			console.log(task, start, end);
		},
		on_progress_change: function(task, progress) {
			console.log(task, progress);
		},
		on_view_change: function(mode) {
			console.log(mode);
		},
		view_mode: 'Month',
		language: 'en'
	});
}

var ig_repo_user = "";
var ig_repo_name = "";

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
	ig_start_regex = /([Ss]tart[Dd]ate)\s*:\s*([^\s]*)/;
	ig_end_regex = /([Ee]nd[Dd]ate|[Dd]ue[Dd]ate)\s*:\s*([^\s]*)/;
	m = issue.body.match(ig_start_regex);
	if (m) if (m[2]) startdate = m[2];
	m = issue.body.match(ig_end_regex);
	if (m) if (m[2]) enddate = m[2];
	return {
		name: title,
		start: startdate,
		end: enddate,
		issue_number: number
	}
}

function ig_get_issues() {
	if (ig_gh_token) {
		ig_get_repo_name();
		var gh = new GitHub({
			token: ig_gh_token
		});
		if (ig_repo_name) {
			var repo = gh.getIssues(ig_repo_user, ig_repo_name);
			console.log(repo);
			repo.listIssues({}, function(err, issues) {
				if (! err) {
					console.log(issues);
					tasks = $.map(issues, ig_create_task)
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
