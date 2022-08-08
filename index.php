<?php include('config.php') ?>

<!DOCTYPE html>
<html lang="en">
<head>
    
    <title><?= $config->title ?></title>
      
    <meta charset="UTF-8" />
    
    <meta http-equiv="X-UA-Compatible"           content="ie=edge" />
    <meta name="viewport"                        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <meta name="theme-color"                     content="<?= $config->theme_color ?>" />
    <meta name="description"                     content="Be a market player" /> 
    <meta name="mobile-web-app-capable"          content="yes" />
    <meta name="mobile-web-app-status-bar-style" content="black" />
    <meta name="mobile-web-app-title"            content="Stocktok" />    
    <meta name="apple-mobile-web-app-capable"    content="yes" />            
    
    <meta property="og:title"                    content="<?= $config->title ?>" />
    <meta property="og:url"                      content="<?= $config->base_url ?>" />
    <meta property="og:image"                    content="<?= $config->base_url ?>/media/img/icons/icon-512x512.png" />    
    <meta property="og:description"              content="Be a market player" />
    
    <link rel="manifest"                         href="/manifest.json?v=1.1">
    <link rel="stylesheet"                       href="/media/css/styles.css?v=1.1.83" />
    <link rel="stylesheet"                       href="/media/avatars/avatars.css?v=1.1.1" />
    <link rel="stylesheet"                       href="/media/css/styles-ipad.css?v=1.1.28" />
    
    <link rel="icon"                             href="<?= $config->dir_icons ?>favicon.png" type="image/png" />
    <link rel="apple-touch-icon"                 href="<?= $config->dir_icons ?>icon-144x144.png" />
    
    <link rel="apple-touch-startup-image"        href="<?= $config->dir_splash ?>apple_splash_2048.png" sizes="2048x2732" />
    <link rel="apple-touch-startup-image"        href="<?= $config->dir_splash ?>apple_splash_1668.png" sizes="1668x2224" />
    <link rel="apple-touch-startup-image"        href="<?= $config->dir_splash ?>apple_splash_1536.png" sizes="1536x2048" />
    <link rel="apple-touch-startup-image"        href="<?= $config->dir_splash ?>apple_splash_1125.png" sizes="1125x2436" />
    <link rel="apple-touch-startup-image"        href="<?= $config->dir_splash ?>apple_splash_1242.png" sizes="1242x2208" />
    <link rel="apple-touch-startup-image"        href="<?= $config->dir_splash ?>apple_splash_750.png" sizes="750x1334" />
    <link rel="apple-touch-startup-image"        href="<?= $config->dir_splash ?>apple_splash_640.png" sizes="640x1136" />
    
    <script src="/media/js/external/jquery.min.js?version=3.5.1"></script>
    <script src="/media/js/external.js?version=1.5"></script>
    <script src="/media/js/internal.js?version=1.5.2"></script>
    <script src="/media/js/internal/app.js?version=1.4"></script>
        
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script src="https://unpkg.com/dayjs@1.8.21/dayjs.min.js"></script>    
    <script src="https://code.highcharts.com/stock/highstock.js"></script>
    <script src="https://code.highcharts.com/stock/modules/data.js"></script>
    <script src="https://code.highcharts.com/stock/indicators/indicators-all.js"></script>
    <script src="https://code.highcharts.com/stock/modules/drag-panes.js"></script>
    <script src="https://code.highcharts.com/modules/annotations-advanced.js"></script>
    <script src="https://code.highcharts.com/modules/price-indicator.js"></script>
    <script src="https://code.highcharts.com/modules/full-screen.js"></script>
       
    <?php if ($config->mode === 'production'): ?>
    
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-HYTRSZLWJV"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-HYTRSZLWJV');
        </script>
        
    <?php endif; ?>
    
</head>  
<body class="hide-scroll">
    <!--
    <div class="popup-info">
        <div class="popup-info-body">
            <div class="icon icon-message"></div>
            <div class="title">Welcome in Stocktok</div>
            <div class="description">This is your first visit<br /><br />To make your game more convinient you can choose some basic settings here.<br /><br /></div>       
            <div class="actions">
                <div class="btn primary">Ok</div>
            </div>
        </div>           
    </div>
    -->
    <div id="css">        
    </div>
    
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
        
        config = {
            version:    '1.1.72',
            api_url:    '/api.php',
            base_url:   '<?= $config->base_url ?>',            
            debug:      <?= $config->debug ?>,
            browser:    navigator.userAgent || navigator.vendor || window.opera,
            precision_rate:  11,
            precision_total: 4
        };                         
        settings = {                                    
            calculation_of_profit_with_purchased_rate:1,
            display_currency:       "pln",
            public:                 "yes",
            analysis_scope:         "total",
            graph_type:             "line",
            graph_line:              1,
            graph_touch:            'tooltip',
            graph_grid:             'xy',
            graph_fullscreen:       false,
            graph_tools:            false,
            graph_labels:           true,
            stock_chart_range:      6,
            homepage:               'wallet',
            
            wallet_switch_behavior:     'itself',
            wallet_layout:              'grid',
            wallet_trend_size:          '5-days',
            wallet_observed_layout:     'box',
            wallet_observed_trend_size: '5-days',
            wallet_header:              'regular',
            
            players_layout:             'box',

            design:{
                color_base:         '#002ce1',
                color_base_invert:  '#ffffff',
                color_base_label:   '#d6e4ff',
                color_text:         '#242424',
                color_label:        '#b2b2b2',
                color_bg:           '#f1f2f4',
                color_bg2:          '#ffffff',
                size_small:         '11px',
                size_regular:       '12px',
                size_medium:        '15px',
                size_big:           '17px',
                hand_preference:    'right',
                border_radius1:     '15px',
                border_radius2:     '5px'
            },            
            
            contributor: 'no'
        };
        
        settings = Object.assign({}, settings, JSON.parse(localStorage.getItem('settings')));
        settings.design.border_radius1 = '5px';
        settings.design.border_radius2 = '5px';
        
        var me;
        
        var mvc = { url: window.location.pathname !== '/' ? window.location.pathname : settings.homepage }; 
        var ios = (/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;
        var fbb = (config.browser.indexOf("FBAN") > -1) || (config.browser.indexOf("FBAV") > -1);
                
        $(document).ready(function(){
            
            if (ios && localStorage.getItem('note_iossafari')===null) mvc.url = "/cms/note_iossafari"; 
            if (fbb && localStorage.getItem('note_fb')===null)        mvc.url = "/cms/note_fb";
            
            init_SW();
            
            load_layout( () => load_page(mvc.url) );            
            
            
        });
                
    </script> 
    
  </body>
</html>
