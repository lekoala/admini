<?php

header('X-Status: redirected');
http_response_code(303);
header("Location: slow-page.php");
die();
