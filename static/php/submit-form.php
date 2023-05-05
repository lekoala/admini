<?php

sleep(random_int(0, 2)); // simulate load time

$fname = $_POST['fname'] ?? null;
$lname = $_POST['lname'] ?? null;

$name = trim($fname . ' ' . $lname) ?? '(no name)';

header('X-Status: posted at ' . date('Y-m-d H:i:s') . ' for ' . $name);

$content = file_get_contents('../forms-simple.html');

// This is where you would replace the value
$content = str_replace('name="fname" ', 'name="fname" value="' . $fname . ' (from server)' . '"', $content);
$content = str_replace('name="lname" ', 'name="lname" value="' . $lname . ' (from server)' . '"', $content);

echo $content;
