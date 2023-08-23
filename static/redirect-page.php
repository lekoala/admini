<?php

header('X-Status: redirected'); // this never appears because 3xx are opaque
http_response_code(302);
header("Location: slow-page.php");
die();
