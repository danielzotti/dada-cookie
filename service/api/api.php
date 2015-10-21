<?php
require_once 'API.class.php';

class CookieAPI extends API
{
    protected $filename;
    protected $dir;

    public function __construct($request, $origin)
    {
        parent::__construct($request);

        $this->filename = strtolower($this->endpoint . "/" . $this->verb . "/" . $this->args[0] . ".json");
        $this->dir = strtolower($this->endpoint . "/" . $this->verb . "/");
    }

    /**
     * Example of an Endpoint
     */
    protected function test()
    {
        $json = array(
            'method' => $this->method,
            'endpoint' => $this->endpoint,
            'verb' => $this->verb,
            'args' => $this->args,
            'filename' => $this->filename
        );
        return json_encode($json);
    }

    protected function short()
    {
        if ($this->method == 'GET') {
            $file = fopen($this->filename, "r");
            $config = fread($file, filesize($this->filename));
            $json_config = json_decode($config, true);
            if ($file) {
                $file = fopen($this->dir.$json_config["text"], "r");
                $html = fread($file, filesize($this->dir.$json_config["text"]));
                if ($file) {
                    $json = array(
                        "text" => $html,
                        "closeButtonText" => $json_config["closeButtonText"],
                        "closeButtonVisible" => $json_config["closeButtonVisible"],
                        "learnMoreButtonText" => $json_config["learnMoreButtonText"],
                        "learnMoreButtonVisible" => $json_config["learnMoreButtonVisible"]
                    );
                    return json_encode($json);
                } else {
                    return "No html cookie file for this site";
                }
            } else {
                return "No configuration file for this site";
            }

        } else {
            return "Only accepts GET requests";
        }
    }

    protected function long()
    {
        if ($this->method == 'GET') {
            $file = fopen($this->filename, "r");
            $config = fread($file, filesize($this->filename));
            $json_config = json_decode($config, true);
            if ($file) {
                $file = fopen($this->dir.$json_config["text"], "r");
                $html = fread($file, filesize($this->dir.$json_config["text"]));
                if ($file) {
                    $json = array(
                        "text" => $html,
                        "closeButtonText" => $json_config["closeButtonText"],
                        "closeButtonVisible" => $json_config["closeButtonVisible"]
                    );
                    return json_encode($json);
                } else {
                    return "No html cookie file for this site";
                }
            } else {
                return "No configuration file for this site";
            }

        } else {
            return "Only accepts GET requests";
        }
    }
}

// Requests from the same server don't have a HTTP_ORIGIN header
if (!array_key_exists('HTTP_ORIGIN', $_SERVER)) {
    $_SERVER['HTTP_ORIGIN'] = $_SERVER['SERVER_NAME'];
}

try {
    $API = new CookieAPI($_REQUEST['request'], $_SERVER['HTTP_ORIGIN']);
    echo $API->processAPI();
} catch (Exception $e) {
    echo json_encode(Array('error' => $e->getMessage()));
}
?>
