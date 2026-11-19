/**
 * ascii.js
 * Block-style ASCII banners, neofetch emblem, and architecture flow diagrams.
 * All art is marked aria-hidden="true" in the DOM and paired with semantic text.
 */

export const KRASSNY_BANNER_WIDE = String.raw`
$$\   $$\                                                                $$$$$$\   $$$$$$\  
$$ | $$  |                                                              $$  __$$\ $$  __$$\ 
$$ |$$  /  $$$$$$\  $$$$$$\   $$$$$$$\  $$$$$$$\ $$$$$$$\  $$\   $$\    $$ /  $$ |$$ /  \__|
$$$$$  /  $$  __$$\ \____$$\ $$  _____|$$  _____|$$  __$$\ $$ |  $$ |   $$ |  $$ |\$$$$$$\  
$$  $$<   $$ |  \__|$$$$$$$ |\$$$$$$\  \$$$$$$\  $$ |  $$ |$$ |  $$ |   $$ |  $$ | \____$$\ 
$$ |\$$\  $$ |     $$  __$$ | \____$$\  \____$$\ $$ |  $$ |$$ |  $$ |   $$ |  $$ |$$\   $$ |
$$ | \$$\ $$ |     \$$$$$$$ |$$$$$$$  |$$$$$$$  |$$ |  $$ |\$$$$$$$ |    $$$$$$  |\$$$$$$  |
\__|  \__|\__|      \_______|\_______/ \_______/ \__|  \__| \____$$ |    \______/  \______/ 
                                                           $$\   $$ |                       
                                                           \$$$$$$  |                       
                                                            \______/                        `.trim();

export const KRASSNY_BANNER_COMPACT = String.raw`
 _  __                             ___  ____  
| |/ /_ __ __ _ ___ ___ _ __  _   / _ \/ ___| 
| ' /| '__/ _' / __/ __| '_ \| | | | | \___ \ 
| . \| | | (_| \__ \__ \ | | | |_| | |_| |__) |
|_|\_\_|  \__,_|___/___/_| |_|\__, |\___/____/ 
                              |___/            `.trim();

export const NEOFETCH_EMBLEM = [
  '        /\\        ',
  '       /  \\       ',
  '      /\\   \\      ',
  '     /  _   \\     ',
  '    /  / \\   \\    ',
  '   /  /___\\   \\   ',
  '  /  /     \\   \\  ',
  ' /__/       \\___\\ ',
  ' [  KRASSNY OS  ] ',
];

export const ARCH_CONSTANCIAS = String.raw`
+-------------------------------------------------------------------+
|  constancias :: Production Architecture (PHP 8.2+ / MySQL 8.0)    |
+-------------------------------------------------------------------+
  HTTP Request
       |
       v
  [ index.php (Front Controller + CSRF Guard) ]
       |
       v
  [ Gatekeeper (Auth & session_regenerate_id) ]
       |
       v
  [ Router ] --> [ Controller ] --> [ ServiceInterface ]
                                           |
                       (Lazy DI via        v
                        ServiceContainer) [ ModelInterface (PDO) ]
                                           |
                                           v
                                    [( MySQL 8.0 )]
                                           |
                                           v
                                  [ PHP Views (h() XSS) ]
`.trim();

export const ARCH_SIGMA = String.raw`
+-------------------------------------------------------------------+
|  SIGMA :: Multi-Role Platform (PHP 8.3 / Slim 4 / MySQL InnoDB)   |
+-------------------------------------------------------------------+
  [ Student | Mentor | Supervisor ]
                 |
                 v
       [ Apache HTTP + PHP-FPM ]  (Docker Compose)
                 |
                 v
       [ Slim 4 Router + PHP-DI ]
          /                 \
         v                   v
  [ League Plates ]   [ Domain Services ]
  (Vanilla ES6 UI)      /            \
                       v              v
              [( MySQL 8.0 )]   [ XLSX / PDF ]
              (InnoDB · ACID)   (PhpSpreadsheet / TCPDF)
`.trim();
