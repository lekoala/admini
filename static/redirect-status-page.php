<?php

header('X-Status: redirected');
http_response_code(200); // 3xx redirects are opaque
// header("Location: forms-simple.html"); // Location header force status regardless
header("X-Location: forms-simple.html");
die();
