<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress-3136398f47');

/** MySQL database username */
define('DB_USER', 'wordpress-3136398f47');

/** MySQL database password */
define('DB_PASSWORD', '9c06cd85dfca');

/** MySQL hostname */
define('DB_HOST', 'sdb-b.hosting.stackcp.net');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'dbW1H3I/he0jackNZj1khHYkAp878/yl');
define('SECURE_AUTH_KEY',  '+NLMPZdYPeRP4BIAqR9RyBOQw2cMbMmm');
define('LOGGED_IN_KEY',    'l1Y63SsJ4WOSH1BPWg64LGQdVsUHpq72');
define('NONCE_KEY',        '0Gd2Fty2hL1f8sKKxF17Fi72nDqIZwnb');
define('AUTH_SALT',        '4Lfy1lAXol7cYmSfXCvajVmAiM/hFHTm');
define('SECURE_AUTH_SALT', '4imRJue3dKD346Mzt6J8+WmWEA1Kr9Fq');
define('LOGGED_IN_SALT',   'FfsrCGgy2NH9UZTGYJkB02cW7Xbqf+Ka');
define('NONCE_SALT',       'Ey5qYTGT4YOk6uGThU3SxyL9kTIA66c8');
/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = '3d_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

define( 'FS_METHOD', 'direct' );
/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
