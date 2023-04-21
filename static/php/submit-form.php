<?php

sleep(random_int(0, 2)); // simulate load time

header('X-Status: "posted at '.date('Y-m-d H:i:s').'"');

$content = file_get_contents('../forms-simple.html');

echo $content;
