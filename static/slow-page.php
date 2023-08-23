<?php
sleep(random_int(1, 3)); // simulate load time
?>
<!DOCTYPE html>
<html lang="en" data-debug=1>

<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

  <!-- page meta -->
  <meta name="description" content="Minimalistic Admin Panel built with Bootstrap 5" />
  <meta name="author" content="LeKoala" />
  <meta name="keywords" content="bootstrap, bootstrap 5, admin, panel, template, minimalistic" />

  <!-- performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- page title & icon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22 viewBox=%220 0 100 100%22><text x=%2250%%22 y=%2252%%22 dominant-baseline=%22central%22 text-anchor=%22middle%22 font-size=%22120%22>💠</text></svg>" />
  <title>Admini</title>

  <!-- styles -->
  <link href="css/admini.min.css" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet" />

  <!-- icons -->
  <script src="js/last-icon.min.js"></script>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Two+Tone" rel="stylesheet" />

  <!-- scripts -->
  <script src="https://cdn.jsdelivr.net/gh/lekoala/nomodule-browser-warning.js/nomodule-browser-warning.min.js" nomodule defer id="nomodule-browser-warning"></script>

  <script type="module" src="js/admini.min.js"></script>
</head>

<body>
  <div class="wrapper">
    <sco-pe id="sidebar-scope">
      <aside id="sidebar" class="sidebar" data-bs-scroll="true">
        <a class="sidebar-brand" href="index.html">
          <span class="sidebar-brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 100 100">
              <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" font-size="120">💠</text>
            </svg>
          </span>
          <span class="sidebar-brand-title">Admini</span>
        </a>


        <!-- mini profile -->
        <div class="sidebar-profile-mini">
          <a href="profile.html" class="btn sidebar-profile-mininame">
            <l-i name="person"></l-i>
            <span>John Nemo with a very long name</span>
          </a>

          <a href="login.html" class="btn">
            <l-i name="exit_to_app"></l-i>
          </a>
        </div>

        <!-- sidebar-content -->
        <div class="sidebar-content scroller">
          <ul class="sidebar-nav">
            <li class="sidebar-item">
              <a class="sidebar-link active" href="index.html" data-scope-hint="main-scope">
                <l-i name="dashboard"></l-i>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="sidebar-item">
              <a class="sidebar-link" href="forms-simple.html" data-scope-hint="main-scope">
                <l-i name="dynamic_form"></l-i>
                <span>Test form submit</span>
              </a>
            </li>
            <li class="sidebar-item">
              <a class="sidebar-link" href="slow-page.php" data-scope-hint="main-scope">
                <l-i name="speed"></l-i>
                <span>Slow page</span>
              </a>
            </li>
            <li class="sidebar-item">
              <a class="sidebar-link" href="slow-page.php">
                <l-i name="speed"></l-i>
                <span>Slow page (no scope hint)</span>
              </a>
            </li>
            <li class="sidebar-item">
              <a class="sidebar-link" href="slow-page-sb.php" data-scope-hint="main-scope">
                <l-i name="speed"></l-i>
                <span>Slow page Sidebar</span>
              </a>
            </li>
            <li class="sidebar-item">
              <a class="sidebar-link" href="redirect-page.php" data-scope-hint="main-scope">
                <l-i name="directions"></l-i>
                <span>Redirect page</span>
              </a>
            </li>
            <li class="sidebar-item">
              <a class="sidebar-link" href="redirect-status-page.php" data-scope-hint="main-scope">
                <l-i name="directions"></l-i>
                <span>Faux Redirect page</span>
              </a>
            </li>
          </ul>
        </div>
        <!-- /sidebar-content -->

        <!-- sidebar-footer -->
        <div class="sidebar-footer">
          <button class="btn btn-default sidebar-toggle js-sidebar-toggle">
            <l-i name="menu_open"></l-i>
          </button>
          <div class="dropup">
            <button class="btn btn-default" id="help-dropdown-btn" data-bs-toggle="dropdown">
              <l-i name="help_outline"></l-i>
            </button>
            <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="help-dropdown-btn">
              <li><a class="dropdown-item" href="help.html">Help</a></li>
              <li><a class="dropdown-item" href="faq.html">FAQ</a></li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <p class="m-3 mb-0">
                <small>Built with Admini</small>
              </p>
            </ul>
          </div>
        </div>
        <!-- /sidebar-footer -->
      </aside>
    </sco-pe>
    <sco-pe id="main-scope">
      <main class="main">
        <div class="main-container">
          <!-- header -->
          <header class="main-header">
            <div class="main-header-sidebar">
              <button type="button" class="btn btn-primary btn-flex btn-square rounded-0" data-bs-toggle="offcanvas" data-bs-target="#sidebar" aria-controls="sidebar">
                <l-i name="menu"></l-i>
              </button>
            </div>
            <div class="main-header-info">
              <!-- breadcrumb -->
              <nav aria-label="breadcrumb">
                <div class="breadcrumb">
                  <li class="breadcrumb-item active" aria-current="page">Admin section</li>
                </div>
              </nav>
            </div>
            <div class="main-header-nav"></div>
          </header>
          <!-- section -->
          <section class="scroller">
            <div class="container-fluid">
              <h1 class="my-4">
                This is a slow page
              </h1>
            </div>
          </section>
        </div>
      </main>
    </sco-pe>
  </div>
</body>

</html>