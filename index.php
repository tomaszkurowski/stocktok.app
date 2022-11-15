<?php 

header("Access-Control-Allow-Origin: *");
//header("Content-Security-Policy: default-src 'self' www.googletagmanager.com *.google-analytics.com data.stocktok.online api.stocktok.online js-agent.newrelic.com bam.eu01.nr-data.net code.highcharts.com ; script-src 'self' 'unsafe-inline' www.googletagmanager.com *.google-analytics.com code.highcharts.com unpkg.com js-agent.newrelic.com bam.eu01.nr-data.net; style-src 'self' 'unsafe-inline' code.highcharts.com; img-src data.stocktok.online code.highcharts.com 'self' blob: data:");
header("X-Frame-Options: SAMEORIGIN");
header("X-Content-Type-Options: nosniff");
//header("Strict-Transport-Security: max-age=31536000");
//header("Cache-Control: max-age=31536000");

include('config.php'); ?>

<!DOCTYPE html>
<html lang="en">
<head>
    
    <title><?= $config['title'] ?></title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": ["WebApplication", "MobileApplication"],
        "name": "Stocktok",
        "url":  "https://stocktok.app",
        "logo": "https://stocktok.app/media/img/icons/icon-512x512.png"
    }
    </script>
    </head>
      
    <meta charset="UTF-8" />
    
    <meta http-equiv="X-UA-Compatible"           content="ie=edge" />
    <meta name="viewport"                        content="width=device-width, initial-scale=1.0 maximum-scale=1.0 minimum-scale=1.0 user-scalable=0" />
    <meta name="theme-color"                     content="<?= $config['theme_color'] ?>" />
    <meta name="description"                     content="Find stocks, currencies, crypto, fantokens, commodities, indices and more" /> 
    <meta name="mobile-web-app-capable"          content="yes" />
    <meta name="mobile-web-app-status-bar-style" content="black" />
    <meta name="mobile-web-app-title"            content="Stocktok" />    
    <meta name="apple-mobile-web-app-capable"    content="yes" />            
    
    <meta property="og:title"                    content="<?= $config['title'] ?>" />
    <meta property="og:url"                      content="<?= $config['base_url'] ?>" />
    <meta property="og:image"                    content="<?= $config['base_url'] ?>/media/img/icons/icon-512x512.png" />    
    <meta property="og:description"              content="Be a market player" />
    
    <link rel="manifest"      href="/manifest.json?v=1.1">
    <!--<link rel="stylesheet"    href="/media/css/styles<?= $config['minify']==='true' ? '.min' : '' ?>.css?v=<?= $config['version_css'] ?>" />-->
    <link rel="stylesheet"    href="/media/css/styles-atomic<?= $config['minify']==='true' ? '.min' : '' ?>.css?v=<?= $config['version_css'] ?>" />
    <link rel="stylesheet"    href="/media/css/styles-atomic-ipad<?= $config['minify']==='true' ? '.min' : '' ?>.css?v=<?= $config['version_css'] ?>" />
    <link rel="stylesheet"    href="/media/css/styles-ipad<?= $config['minify']==='true' ? '.min' : '' ?>.css?v=<?= $config['version_css'] ?>" />
    
    <!-- in Tests -->
    <link rel="stylesheet"    href="/media/css/nouislider<?= $config['minify']==='true' ? '.min' : '' ?>.css?v=<?= $config['version_css'] ?>" />
    
    <link rel="icon"                             href="<?= $config['dir_icons'] ?>favicon.png" type="image/png" />
    <link rel="apple-touch-icon"                 href="<?= $config['dir_icons'] ?>icon-144x144.png" />
    
    <link rel="apple-touch-startup-image"        href="<?= $config['dir_splash'] ?>apple_splash_2048.png" sizes="2048x2732" />
    <link rel="apple-touch-startup-image"        href="<?= $config['dir_splash'] ?>apple_splash_1668.png" sizes="1668x2224" />
    <link rel="apple-touch-startup-image"        href="<?= $config['dir_splash'] ?>apple_splash_1536.png" sizes="1536x2048" />
    <link rel="apple-touch-startup-image"        href="<?= $config['dir_splash'] ?>apple_splash_1125.png" sizes="1125x2436" />
    <link rel="apple-touch-startup-image"        href="<?= $config['dir_splash'] ?>apple_splash_1242.png" sizes="1242x2208" />
    <link rel="apple-touch-startup-image"        href="<?= $config['dir_splash'] ?>apple_splash_750.png"  sizes="750x1334" />
    <link rel="apple-touch-startup-image"        href="<?= $config['dir_splash'] ?>apple_splash_640.png"  sizes="640x1136" />
    
    <script src="/media/js/external/jquery.min.js?version=3.5.1"></script>
    <script src="/media/js/external/dataTables/dataTables.js?version=1.1.1"></script>
    <script src="/media/js/external/dataTables/dataTables.responsive.js?version=1.1.1"></script>
    <script src="/media/js/external/dataTables/dataTables.colResize.js?version=1.1.1"></script>
    <script src="/media/js/external/dataTables/dataTables.colReorder.js?version=1.1.1"></script>    
    <script src="/media/js/external/dataTables/dataTables.fixedColumns.min.js?version=1.1.1"></script>
    <script src="/media/js/external/dataTables/dataTables.buttons.min.js?version=1.1.1"></script>
    <script src="/media/js/external/dataTables/dataTables.buttons.html5.min.js?version=1.1.1"></script>
    <script src="/media/js/external/dataTables/dataTables.buttons.colVis.min.js?version=1.1.1"></script>
    <script src="/media/js/external/js-cookie.min.js?version=3.0.1"></script> 
    <script src="/media/js/external/kmturley/TouchScroll.js"></script> 
    <script src="/media/js/external/kmturley/dragDrop.js"></script> 
    <script src="/media/js/external/kmturley/RequestAnimationFrame.js"></script>
    <script src="/media/js/external/leongersen/nouislider.js"></script>
    <script src="/media/js/external/TradingView/tv.js?v=0.0.2"></script>
    <script type="text/javascript" src="/media/js/external/TradingView/charting_library/charting_library.standalone.js"></script>
        
    <script src="/media/js/internal.js?version=<?= $config['version_js'] ?>"></script>
    <script src="/media/js/internal/app<?= $config['minify']==='true' ? '.min' : '' ?>.js?version=<?= $config['version_js'] ?>"></script>          
    <script src="/media/js/external.js?version=<?= $config['version_js'] ?>"></script>
       
    <?php if ($config['mode'] === 'production'): ?>
    
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-HYTRSZLWJV"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '<?= $config['google_analytics'] ?>');
        </script>
        
    <?php endif; ?>
    
</head>  
<body class="hide-scroll"> 
    <div id="transparent-bg"></div>
    <div id="css"></div>   
    <div id="app">
        <div class="app-body">
            <main></main>
            <footer></footer>
        </div>
        <nav></nav>
    </div>   
    <div id="loader">
        <div class="icon icon-logo"></div>
        <span></span>
    </div>
    <script type="text/javascript"> 
        
        loader = {};
        config = {
            version:        '<?= $config['version_js'] ?>', 
            base_url:       '<?= $config['base_url'] ?>',            
            title_prefix:   '<?= $config['title_prefix'] ?>',            
            minify:         <?= $config['minify'] ?>,            
            debug:          <?= $config['debug'] ?>,            
            api_url:        '/api.php',
            
            browser:        navigator.userAgent || navigator.vendor || window.opera,
            precision_rate: 11,
            precision_total:4,

            locale:         Intl.DateTimeFormat().resolvedOptions().locale,
            timezone:       Intl.DateTimeFormat().resolvedOptions().timeZone
        };                         
        settings = { 
            theme:                  "light",
            display_currency:       "usd",           
                        
            tview_style: 2, // Line
            tview_hide_top_toolbar:     true,
            tview_hide_bottom_toolbar:  false,
            tview_hide_bottom_toolbar2: true,
            tview_hide_side_toolbar:    true,
            tview_hide_legend:          true,
            tview_details:              false,
            tview_hidevolume:           true,
                                    
            wallet_show_graph:      true,
            wallet_show_switcher:   true,
            wallet_show_results:    true,
            wallet_show_price:      true,
            wallet_show_logo:       true,
            wallet_show_active:     true,
            wallet_show_sold:       true,
            wallet_show_grouped:    false,
            
            design:{
                size_small:         '12px',
                size_regular:       '14px',
                size_medium:        '16px',
                size_big:           '20px',
                hand_preference:    'right',
                border_radius1:     '5px',
                border_radius2:     '5px'
            },            
            mute:1,
            contributor: 'no',
            rememberMe: true,
            screener: {}
        };        
        settings = Object.assign({}, settings, JSON.parse(localStorage.getItem('settings')));
        
        if ($.inArray(settings.view_search,     ['grid','screener','boxes']) === -1){       settings.view_search = 'boxes'; }
        if ($.inArray(settings.view_wallet,     ['grid','screener']) === -1){               settings.view_wallet = 'grid'; }        
        if ($.inArray(settings.view_observed,   ['grid','screener']) === -1){               settings.view_observed = 'grid'; }
        if ($.inArray(settings.view_screener,   ['performance','company','all']) === -1){   settings.view_screener = 'all'; }        
        if ($.inArray(settings.trend_wallet,    ['5-days','5-weeks','6-months']) === -1){   settings.trend_wallet = '5-days'; }
        if ($.inArray(settings.trend_observed,  ['5-days','5-weeks','6-months']) === -1){   settings.trend_observed = '5-days'; }
        if ($.inArray(settings.trend_search,    ['5-days','5-weeks','6-months']) === -1){   settings.trend_search = '5-days'; }
        if ($.inArray(settings.wallet_sort,     ['margin','marginp','total','custom']) === -1){   settings.wallet_sort = 'margin'; }

        settings.homepage = '/wallet';
        if (!settings.view_boxes_additionals) settings.view_boxes_additionals = {};

        var me;
        
        var mvc     = { url: window.location.pathname !== '/' ? window.location.pathname : settings.homepage }; 
        var ios     = (/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;
        var fbb     = (config.browser.indexOf("FBAN") > -1) || (config.browser.indexOf("FBAV") > -1);
        var mobile  = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
                
        $(document).ready(function(){                        
            init_SW();            
            load_layout( () => load_page(mvc.url) );                                    
        });
                
    </script>     
  </body>
</html>
