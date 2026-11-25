<?php
/**
 * Plugin Name: Nana Tips Notifications
 * Description: Stores Nana Tips app devices and alerts them when a post is published.
 */

if (!defined('ABSPATH')) {
    exit;
}

const NANA_TIPS_DEVICES = 'nana_tips_devices';

/**
 * @return array<string, array{platform: string, updated: int}>
 */
function nana_tips_devices(): array {
    $devices = get_option(NANA_TIPS_DEVICES, array());
    return is_array($devices) ? $devices : array();
}

/**
 * @param array<string, array{platform: string, updated: int}> $devices
 */
function nana_tips_save_devices(array $devices): void {
    update_option(NANA_TIPS_DEVICES, $devices, false);
}

function nana_tips_valid_token(string $token): bool {
    return (bool) preg_match('/^ExponentPushToken\[[A-Za-z0-9_-]{8,}\]$/', $token);
}

add_action('rest_api_init', function () {
    register_rest_route('nana-tips/v1', '/devices', array(
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'nana_tips_register_device',
    ));
    register_rest_route('nana-tips/v1', '/devices/remove', array(
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'nana_tips_remove_device',
    ));
});

function nana_tips_register_device(WP_REST_Request $request) {
    $token = trim((string) $request->get_param('token'));
    $platform = sanitize_key((string) $request->get_param('platform'));
    if (!nana_tips_valid_token($token)) {
        return new WP_Error('invalid_token', 'Unrecognized device token.', array('status' => 400));
    }
    if (!in_array($platform, array('android', 'ios', 'web'), true)) {
        $platform = 'android';
    }

    $devices = nana_tips_devices();
    $devices[$token] = array(
        'platform' => $platform,
        'updated' => time(),
    );
    if (count($devices) > 5000) {
        uasort($devices, function ($left, $right) {
            return (int) ($left['updated'] ?? 0) <=> (int) ($right['updated'] ?? 0);
        });
        $devices = array_slice($devices, -5000, null, true);
    }
    nana_tips_save_devices($devices);
    return array('ok' => true);
}

function nana_tips_remove_device(WP_REST_Request $request) {
    $token = trim((string) $request->get_param('token'));
    $devices = nana_tips_devices();
    unset($devices[$token]);
    nana_tips_save_devices($devices);
    return array('ok' => true);
}

add_action('transition_post_status', function ($new_status, $old_status, $post) {
    if ($new_status !== 'publish' || $old_status === 'publish') {
        return;
    }
    if (!$post instanceof WP_Post || $post->post_type !== 'post') {
        return;
    }
    nana_tips_notify_published_post($post);
}, 10, 3);

function nana_tips_notify_published_post(WP_Post $post): void {
    $tokens = array_values(array_filter(array_keys(nana_tips_devices()), 'nana_tips_valid_token'));
    if (!$tokens) {
        return;
    }

    $title = html_entity_decode(get_the_title($post), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $messages = array();
    foreach ($tokens as $token) {
        $messages[] = array(
            'to' => $token,
            'title' => 'New story on Nana Tips',
            'body' => $title,
            'sound' => 'default',
            'channelId' => 'stories',
            'data' => array('slug' => $post->post_name),
        );
    }

    foreach (array_chunk($messages, 100) as $chunk) {
        $response = wp_remote_post('https://exp.host/--/api/v2/push/send', array(
            'timeout' => 15,
            'headers' => array(
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ),
            'body' => wp_json_encode($chunk),
        ));
        if (is_wp_error($response)) {
            continue;
        }
        $body = json_decode((string) wp_remote_retrieve_body($response), true);
        $tickets = is_array($body) && isset($body['data']) && is_array($body['data']) ? $body['data'] : array();
        $devices = nana_tips_devices();
        $changed = false;
        foreach ($tickets as $index => $ticket) {
            $error = is_array($ticket) ? ($ticket['details']['error'] ?? '') : '';
            if ($error === 'DeviceNotRegistered' && isset($chunk[$index]['to'])) {
                unset($devices[$chunk[$index]['to']]);
                $changed = true;
            }
        }
        if ($changed) {
            nana_tips_save_devices($devices);
        }
    }
}
