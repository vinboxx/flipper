<?php
// Force PHP 5.3.0+ to take time zone information from OS
if (version_compare(phpversion(), '5.3.0', '>='))
{
    @date_default_timezone_set('UTC');
}

require 'Slim/Slim.php';
use Slim\Slim;
Slim::registerAutoloader();

// Twig
require "Twig/lib/Twig/Autoloader.php";
Twig_Autoloader::register();

// Load config
$config = require 'config/config.php';

// Paris and Idiorm
require 'Paris/idiorm.php';
require 'Paris/paris.php';
ORM::configure('mysql:host=localhost;dbname='.$config['db.name']);
ORM::configure('username', $config['db.user']);
ORM::configure('password', $config['db.password']);
ORM::configure('driver_options', array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));

// Models
require 'models/Leaderboard.php';

// User Agent detection
include 'lib/PhpUserAgent/UserAgentParser.php';
include 'lib/MobileDetect/Mobile_Detect.php';
$detect = new Mobile_Detect();


/**
 * Start application
 */
$app = new Slim(array(
    'view' => new \Slim\Extras\Views\Twig()
));
$app->config($config);

// Home
$app->get('/', function () use ($app) {
    $data = array(
        'page_title' => 'Flipper'
   );
    $app->render('home.php', $data);
});

// Leaderboard
$app->get('/leaderboard', function () use ($app) {
    $data = array(
        'page_title' => 'Leaderboard | Flipper'
   );

    $app->render('leaderboard.php', $data);
});

// Get records
$app->get('/records', function () use ($app) {
    $app->response()->header("Content-Type", "application/json");
    $leaderboard = Model::factory('Leaderboard')->order_by_desc('score')->limit(50)->find_array();
    if (count($leaderboard)) {
        foreach ($leaderboard as &$record) {
            $record['device'] = getDeviceType($record['user_agent']);
        }
        echo json_encode($leaderboard);
    }
    else{
        echo json_encode(array(
            "status" => false,
            "message" => "No record"
            ));
    }
});

// Add new record
$app->post('/records', function () use ($app) {
    $app->response()->header("Content-Type", "application/json");

    $record = Model::factory('Leaderboard')->create();
    $record->username   = $app->request()->post('username');
    $record->score  = $app->request()->post('score');
    $record->user_agent    = $app->request()->getUserAgent();
    $record->timestamp = time();
    $record->save();

    echo json_encode(array("id" => $record->id()));
});

// Update record
$app->put('/records/:id', function ($id) use ($app) {
    $app->response()->header("Content-Type", "application/json");

    $record = Model::factory('Leaderboard')->find_one($id);

    if (! $record instanceof Leaderboard) {
       echo json_encode(array(
            "status" => false,
            "message" => "Record id $id does not exist"
            ));
    }

    $record->username   = $app->request()->post('username');
    $record->score  = $app->request()->post('score');
    $record->user_agent    = $app->request()->getUserAgent();
    $record->timestamp = time();

    if($result = $record->save()) {
        echo json_encode(array(
            "status" => (bool)$result,
            "message" => "Record updated successfully"
            ));
    } else {
        echo json_encode(array(
            "status" => (bool)$result,
            "message" => "Record update fail"
            ));
    }
});

// DELETE record
$app->delete("/records/:id", function ($id) use($app) {
    $app->response()->header("Content-Type", "application/json");

    $record = Model::factory('Leaderboard')->find_one($id);

    if ($record instanceof Leaderboard) {
        if($result = $record->delete()) {
            echo json_encode(array(
                "status" => (bool)$result,
                "message" => "Record deleted successfully"
            ));
        } else {
            echo json_encode(array(
                "status" => (bool)$result,
                "message" => "Record delete fail"
            ));
        }
    } else {
        echo json_encode(array(
            "status" => false,
            "message" => "Record id $id does not exist"
        ));
    }
});

function getDeviceType($userAgent)
{
        global $detect;
        if($userAgent == '') {
            return $device = 'Unknown';
        }

        // Get browser
        $detect->setUserAgent($userAgent);
        $aspect = parse_user_agent($userAgent);
        $browser = $aspect['browser'];
        $browser_icon = '';

        switch (strtolower($browser)) {
            case 'chrome': $browser_icon = 'chrome.png'; break;
            case 'firefox': $browser_icon = 'firefox.png'; break;
            case 'safari': $browser_icon = 'safari.png'; break;
            case 'iemobile': $browser_icon = 'ie-mobile.png'; break;
            case 'opera': $browser_icon = 'opera.png'; break;
            default: break;
        }

        // Get device
        if($detect->isMobile() || $detect->isTablet()) {
            $devices = array_merge(
                $detect->getPhoneDevices(),
                $detect->getTabletDevices()
            );

            foreach($devices as $key => $regex){
                $regex = str_replace('/', '\/', $regex);
                $match = (bool)preg_match('/'.$regex.'/is', $userAgent);
                if($match){
                    $device = $key;
                    break;
                }
            }

            $lowercase_device = strtolower($device);
            switch ($lowercase_device) {
                case ($lowercase_device == 'iphone' || $lowercase_device == 'ipad'): $device_icon = 'apple.png'; break;
                case ($lowercase_device == 'htc' || $lowercase_device == 'htctablet'): $device_icon = 'htc.png'; break;
                case ($lowercase_device == 'samsung' || $lowercase_device == 'samsungtablet'): $device_icon = 'samsung.png'; break;
                case ($lowercase_device == 'nexus' || $lowercase_device == 'nexustablet'): $device_icon = 'nexus.png'; break;
                case 'nokia': $device_icon = 'nokia.png'; break;
                case 'sony': $device_icon = 'sony.png'; break;
                case 'lg': $device_icon = 'lg.png'; break;
                case 'acer': $device_icon = 'acer.png'; break;
                default: break;
            }

            if (!$detect->is('Chrome') && !$detect->is('iPhone') && !$detect->is('iPad')) {
                $browser = 'Android browser';
                $browser_icon = 'android-stock.png';
            }
        // or Get desktop
        } else {
            $device = $aspect['platform'];
            switch (strtolower($device)) {
                case 'windows': $device_icon = 'pc-windows.png'; break;
                case 'linux': $device_icon = 'pc-linux.png'; break;
                case 'macintosh': $device_icon = 'mac.png'; break;
                default: break;
            }
        }

        return array(
            'browser' => $browser,
            'browser_icon' => $browser_icon,
            'brand' => $device,
            'device_icon' => $device_icon
        );
}

$app->run();