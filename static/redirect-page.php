<?php

header('X-Status: redirected'); // this never appears because 3xx are opaque
http_response_code(303);
header("Location: slow-page.php");
die();
