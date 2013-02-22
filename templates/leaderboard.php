<!DOCTYPE html>
<html>
<head>
<title>{{ page_title }}</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" type="text/css" href="../assets/css/bootstrap.min.css" />
<link rel="stylesheet" type="text/css" href="../assets/css/bootstrap-responsive.min.css" />
<link rel="stylesheet" type="text/css" href="assets/css/style.css" />
<!--[if lt IE 9]>
  <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
</head>
<body>
  <div id="page">
    <div class="container-fluid">
      <div class="row-fluid">
        <div class="leaderboard">
          <h1>Leaderboard</h1>
          <small class="muted pull-right loading btn-link" disabled style="display:none">Updating...</small>
          <p>
            <small class="muted">Last update : <span class="updated-time"></span></small>
            <span class="muted">|</span>
            <small><a class="toggle-update started" href="#">Stop update</a></small>
          </p>
          <table class="leaderboard-table table table-bordered table-hover">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th class="hidden-phone">Browser</th>
                <th class="hidden-phone">Device</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="5">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script type="text/javascript" src="assets/js/leaderboard.js"></script>
</body>
</html>