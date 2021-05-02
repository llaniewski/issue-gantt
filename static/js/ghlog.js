
var ig_secure_cookie = true;
var ig_I_am_secure = false;
var ig_gh_token = "";

$(function() {
  console.log(location.hostname);

  if (location.hostname == "localhost") {
    ig_secure_cookie = false;
    ig_I_am_secure = true;
  } else {
    if (location.protocol == "https:") {
      ig_I_am_secure = true;
    }
  }
  console.log(ig_I_am_secure);
})

function ig_go_secure() {
  console.log(ig_I_am_secure);
  if (! ig_I_am_secure) location.protocol = "https:";
}

function ig_editor_login () {
      var authenticator = new netlify.default ({site_id: "gantt.tclb.io"});
      authenticator.authenticate({provider:"github", scope: "repo"}, function(err, data) {
        if (err) {
          return alert("Error Authenticating with GitHub: " + err);
        }
        Cookies.set('gh_token', data.token, { secure: ig_secure_cookie });
        ig_gh_token = data.token;
        ig_editor_check_login();
      });
}

function ig_editor_logout () {
  Cookies.remove('gh_token');
  Cookies.remove('gh_profile');
  ig_editor_check_login();
}


$(function() {
  $("ul#navbar-nav").append(
    $("<li>", { class: "nav-item", id: "nav-logout" }).append(
          $("<a>", { href: "javascript:ig_editor_logout();" }).text("Logout")
    ).hide()
  ).append(
    $("<li>", { class: "nav-item", id: "nav-avatar" }).append(
      $("<div>", { class: "avatar-container" }).append(
        $("<img>", { id: "nav-profile-avatar", class: "avatar-img rounded-circle" })
      )
    ).hide()
  );
})


function ig_editor_disp_prof(profile) {
          $("#nav-profile-avatar").attr("src",profile.avatar_url);
          $("#nav-avatar").show();
          $("#nav-logout").show();
}

function ig_editor_check_login() {
  if (ig_I_am_secure) {
    var gh_token = Cookies.get('gh_token');
    ig_gh_token = gh_token;
    if (gh_token) {
      console.log(gh_token);
      $("#nav-login").hide();
      profile =  Cookies.getJSON('gh_profile');
      if (profile) {
        ig_editor_disp_prof(profile);
      } else {
        var gh = new GitHub({
          token: gh_token
        });
        var me = gh.getUser();
        console.log(me);
        me.getProfile(function(err, profile) {
          if (! err) {
            console.log(profile);
            ig_editor_disp_prof(profile);
            Cookies.set('gh_profile',profile, { secure: ig_secure_cookie });
          } else {
            console.log(err);
          }
        });
      }
    } else {
      $("#nav-login a").attr("href", "javascript:ig_editor_login();");
      $("#nav-login a i").attr("class", "now-ui-icons users_circle-08");
      $("#nav-login").show();
      $("#nav-logout").hide();
    }
  } else {
      $("#nav-login a").attr("href", "javascript:ig_go_secure();");
      $("#nav-login").show();
      $("#nav-logout").hide();
  }    
}

$(function() { ig_editor_check_login(); })

$(ig_go_secure);

