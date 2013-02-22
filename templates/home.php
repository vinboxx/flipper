<!DOCTYPE html>
<html>
<head>
<title>{{ page_title }}</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" type="text/css" href="assets/css/style.css" />
<!--[if lt IE 9]>
  <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
</head>
<body>

  <div id="page">
    <div id="header"></div>
    <div id="content">
        <div class="flip-container"></div>
        <div class="stat-panel">
          <div class="stat">
              <small>Clicks: <span class="current-click">0</span></small> |
              <small>Time: <span class="time">00:00:00</span></small> |
              <small><b class="restart">Restart</b></small>
          </div>
          <h2 class="score">Score: <span class="current-score">0</span></h2>
          <div class="bonus"></div>
        </div>
    </div>
    <div id="footer"></div>
  </div>

  <div id="card-template" aria-hidden="true">
      <div class="flipper">
        <div class="front">
            <div class="label unselectable">=</div>
        </div>
        <div class="back"> 
            <div class="label unselectable"></div>
        </div>
    </div>
  </div>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script type="text/javascript" src="assets/js/app.js"></script>
</body>
</html>