/**
 * @file
 * Default values for the configuration options of the application.
 */

import { type Config } from 'config';

const skybrushIcon =
  'data:image/png;base64,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';

const defaults: Config = {
  branding: {
    splashIcon: skybrushIcon,
    splashTitle: 'XAG Swarm GCS',
  },

  ephemeral: false,

  examples: {
    shows: [],
  },

  features: {
    loadShowFromCloud: false,
    perspectives: false,
  },

  headerComponents: [
    ['uav-status-summary'],
    [
      'altitude-summary-header-button',
      'battery-status-header-button',
      'rtk-status-header-button',
    ],
    ['weather-header-button'],
    ['connection-status-button'],
    [
      'server-connection-settings-button',
      'geofence-settings-button',
      'authentication-button',
    ],
    [
      'broadcast-button',
      'toolbox-button',
      'app-settings-button',
      'alert-button',
      'help-button',
      'full-screen-button',
      'session-expiry-box',
    ],
  ],

  map: {
    drawingTools: [
      ['select', 'zoom'],
      [
        'add-marker',
        'draw-path',
        'draw-circle',
        'draw-rectangle',
        'draw-polygon',
        'cut-hole',
        'edit-feature',
      ],
    ],

    features: {
      onCreate() {
        /* do nothing */
      },
    },
  },

  optimizeForSingleUAV: {
    default: false,
    force: false,
  },

  optimizeUIForTouch: {
    default: null,
    force: false,
  },

  perspectives: ['default'],

  ribbon: {
    label: null,
    position: 'bottomRight',
  },

  server: {
    connectAutomatically: true,
    preventAutodetection: false,
    preventManualSetup: false,
    hostName: 'localhost',
    port: null,
    isSecure: null,
    warnClockSkew: true,
  },

  session: {
    maxLengthInSeconds: null,
  },

  toastPlacement: 'top-center',
  tour: null,

  urls: {
    help: 'https://www.google.com/',
    exit: null,
  },
  strike_url: [
    {
      id: 1,
      url: 'http://192.168.6.151:8000/strike',
    },
    {
      id: 2,
      url: 'http://192.168.6.152:8000/strike',
    },
    {
      id: 3,
      url: 'http://192.168.6.153:8000/strike',
    },
    {
      id: 4,
      url: 'http://192.168.6.154:8000/strike',
    },
    {
      id: 5,
      url: 'http://192.168.6.155:8000/strike',
    },
    {
      id: 6,
      url: 'http://192.168.6.156:8000/strike',
    },
    {
      id: 7,
      url: 'http://192.168.6.157:8000/strike',
    },
    {
      id: 8,
      url: 'http://192.168.6.158:8000/strike',
    },
    {
      id: 9,
      url: 'http://192.168.6.159:8000/strike',
    },
    {
      id: 10,
      url: 'http://192.168.6.160:8000/strike',
    },
  ],
  camera_url: [
    {
      id: 1,
      url: '192.168.6.155',
      connection: false,
    },
    // {
    //   id: 2,
    //   url: '192.168.6.153',
    //   connection: false,
    // },
    // {
    //   id: 3,
    //   url: '192.168.6.153',
    //   connection: false,
    // },
    // {
    //   id: 4,
    //   url: '192.168.6.154',
    //   connection: false,
    // },
    // {
    //   id: 5,
    //   url: '192.168.6.155',
    //   connection: false,
    // },
    // {
    //   id: 6,
    //   url: '192.168.6.156',
    //   connection: false,
    // },
    // {
    //   id: 7,
    //   url: '192.168.6.157',
    //   connection: false,
    // },
    // {
    //   id: 8,
    //   url: '192.168.6.158',
    //   connection: false,
    // },
    // {
    //   id: 9,
    //   url: '192.168.6.159',
    //   connection: false,
    // },
    // {
    //   id: 10,
    //   url: '192.168.6.160',
    //   connection: false,
    // },
  ],
};

export default defaults;
