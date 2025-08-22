import React from 'react';
import PropTypes from 'prop-types';
import { layer as olLayer, source } from '@collmot/ol-react';

import icon from '~/../assets/img/target.png';
import { changeSelectedCameraIp } from '~/features/swarm/slice';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { showError } from '~/features/snackbar/actions';

import { connect } from 'react-redux';
import { setLayerParametersById } from '~/features/map/layers';
import { mapViewCoordinateFromLonLat } from '~/utils/geography';
import {
  MenuItem,
  TextField,
  Button,
  Box,
  Typography,
} from '@material-ui/core';
import { showNotification } from '~/features/snackbar/slice';
import { MessageSemantics } from '~/features/snackbar/types';
import messageHub from '~/message-hub';

// === Settings component for the camera icon layer ===

// class CameraLayerSettingsPresentation extends React.Component {
//   static propTypes = {
//     layer: PropTypes.object,
//     setLayerParameters: PropTypes.func,
//   };

//   render() {
//     const { layer } = this.props;
//     const parameters = {
//       iconUrl: icon,
//       iconScale: 0.06,
//       ...(layer?.parameters || {}),
//     };
//   }
// }

// export const CameraLayerSettings = connect(null, (dispatch, ownProps) => ({
//   setLayerParameters: (params) =>
//     dispatch(setLayerParametersById(ownProps.layerId, params)),
// }))(CameraLayerSettingsPresentation);

// === Camera icon source component ===

class CameraSource extends React.Component {
  static propTypes = {
    lat: PropTypes.number,
    lon: PropTypes.number,
    iconUrl: PropTypes.string,
    iconScale: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this._sourceRef = null;
    this._feature = null;
  }

  _assignSourceRef = (ref) => {
    this._sourceRef = ref;
    this._updateFeature();
  };

  _updateFeature = () => {
    const { lat, lon, iconUrl, iconScale } = this.props;

    if (!lat || !lon || !this._sourceRef) return;

    const coord = mapViewCoordinateFromLonLat([lon, lat]);

    if (!this._feature) {
      this._feature = new Feature(new Point(coord));
    } else {
      this._feature.getGeometry().setCoordinates(coord);
    }

    this._feature.setStyle(
      new Style({
        image: new Icon({
          src: iconUrl,
          scale: iconScale,
          anchor: [0.5, 0.5],
        }),
      })
    );

    const source = this._sourceRef.source;
    source.clear();
    source.addFeature(this._feature);
  };

  componentDidMount() {
    this._updateFeature();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.lat !== this.props.lat ||
      prevProps.lon !== this.props.lon ||
      prevProps.iconUrl !== this.props.iconUrl ||
      prevProps.iconScale !== this.props.iconScale
    ) {
      this._updateFeature();
    }
  }

  render() {
    return <source.Vector ref={this._assignSourceRef} />;
  }
}

class CameraLayerSettingsPresentation extends React.Component {
  static propTypes = {
    layer: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    selectedIPFromStore: PropTypes.string,
  };

  state = {
    selectedIP: '',
  };
  componentDidMount() {
    const { selectedIPFromStore } = this.props;
    if (selectedIPFromStore) {
      this.setState({ selectedIP: selectedIPFromStore });
    }
  }

  handleChange = (e) => {
    this.setState({ selectedIP: e.target.value });
  };

  handleSubmit = async () => {
    const { selectedIP } = this.state;
    const { dispatch } = this.props;
    try {
      const res = await messageHub.sendMessage({
        type: 'X-CAMERA',
        message: 'camera-inital',
        selected: selectedIP,
      });
      if (Boolean(res?.body?.message)) {
        console.log('Selected IP:', selectedIP);
        dispatch(changeSelectedCameraIp(selectedIP));
        dispatch(
          showNotification({
            message: 'Camera Polygen Activated..',
            semantics: MessageSemantics.SUCCESS,
          })
        );
      }
    } catch (e) {
      dispatch(showError(`${e} Message failed to send`));
    }

    // You can replace this with your custom showNotification() if needed
  };

  render() {
    const { selectedIP } = this.state;

    return (
      <Box p={2}>
        <Typography variant='h6' gutterBottom>
          Select Camera IP
        </Typography>

        <TextField
          select
          fullWidth
          label='Camera IP'
          variant='outlined'
          value={selectedIP}
          onChange={this.handleChange}
          margin='normal'
        >
          <MenuItem value='192.168.6.121'>192.168.6.121</MenuItem>
          <MenuItem value='192.168.6.122'>192.168.6.122</MenuItem>
          <MenuItem value='192.168.6.123'>192.168.6.123</MenuItem>
        </TextField>

        <Button
          variant='contained'
          color='primary'
          onClick={this.handleSubmit}
          disabled={!selectedIP}
        >
          Submit
        </Button>
      </Box>
    );
  }
}

export const CameraLayerSettings = connect((state) => ({
  selectedIPFromStore: state.socket.selectedCameraip,
}))(CameraLayerSettingsPresentation);

// === Presentation component for the CameraLayer ===

const CameraLayerPresentation = ({ layer = {}, zIndex = 10, lat, lon }) => {
  const { iconUrl = icon, iconScale = 0.06 } = layer.parameters || {};

  return (
    <olLayer.Vector updateWhileAnimating updateWhileInteracting zIndex={zIndex}>
      <CameraSource
        lat={lat}
        lon={lon}
        iconUrl={iconUrl}
        iconScale={iconScale}
      />
    </olLayer.Vector>
  );
};

CameraLayerPresentation.propTypes = {
  layer: PropTypes.object,
  zIndex: PropTypes.number,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
};

// === Final Exported Component ===

// export const CameraLayer = () => {
//   const staticLat = 13.0505301;
//   const staticLon = 80.2120814;

//   return <CameraLayerPresentation lat={staticLat} lon={staticLon} />;
// };
// import defaultIcon from '~/../assets/img/up1.png'; // your image

const defaultLayer = {
  parameters: {
    iconUrl: icon,
    iconScale: 0.05,
  },
};

const DynamicCameraLayer = ({ TargetLattitude, TargetLongititude }) => {
  return (
    <CameraLayerPresentation
      lat={TargetLattitude}
      lon={TargetLongititude}
      layer={defaultLayer}
    />
  );
};

export const CameraLayer = connect((state) => ({
  TargetLattitude: state.socket.cameraTargetLattitude,
  TargetLongititude: state.socket.cameraTargetLongititude,
  CameraLattitude: state.socket.cameraLattitude,
  CameraLongititude: state.socket.cameraLongitiude,
  CameraYaw: state.socket.cameraYaw,
}))(DynamicCameraLayer);
