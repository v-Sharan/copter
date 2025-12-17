import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Box,
  FormGroup,
  FormControl,
  InputLabel,
  Input,
} from '@material-ui/core';
import { getCurrentServerState } from '~/features/servers/selectors';
import { showNotification } from '~/features/snackbar/slice';
import { MessageSemantics } from '~/features/snackbar/types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import messageHub from '~/message-hub';
import {
  getSelectedFeatureIds,
  getFeatureById,
  getFeaturesInOrder,
} from '~/features/map-features/selectors';
import { getSelectedUAVIds } from '~/features/uavs/selectors';
import {
  changeCoverage,
  changeCamAlt,
  changeOverlap,
  changeAntennaBearing,
  changeZoomLevel,
  openGroupSplitDialog,
  setTime,
} from '~/features/swarm/slice';
import { showError } from '~/features/snackbar/actions';
import { getLandingMissionId } from '~/features/mission/selectors';
import {
  DownloadMissionTrue,
  setMissionFromServer,
} from '~/features/uavs/details';
import { bearing } from '~/utils/geography';

const SwarmPanel = ({
  selectedUAVIds,
  selectedFeatureIds,
  getFeatureBySelected,
  dispatch,
  socketData,
  antennaBearing,
  landingFeature,
  features,
  connection,
  onOpen,
}) => {
  const handleFenceMission = async () => {
    const featuresInMap = selectedFeatureIds.map((i) => {
      return getFeatureBySelected(i);
    });

    if (featuresInMap.length == 0) {
      showError('Select the Polygon or a Point in the Map');
      return;
    }
    try {
      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message: 'fence',
        ids: selectedUAVIds,
        features: featuresInMap,
        ...socketData,
      });
      console.log('RES>>>>>>>>>>', res);
      if (Boolean(res?.body?.message)) {
        dispatch(
          showNotification({
            message: `Fence Mission Message sent`,
            semantics: MessageSemantics.SUCCESS,
          })
        );
      }
      if (res?.body?.message[0]?.length == 0) {
        dispatch(
          showNotification({
            message: `Read a Empty Mission`,
            semantics: MessageSemantics.WARNING,
          })
        );
        return;
      }
      dispatch(setMissionFromServer(res.body.message));
      dispatch(
        showNotification({
          message: `${res.body.message[0].length}`,
          semantics: MessageSemantics.WARNING,
        })
      );
    } catch (e) {
      console.log(e);
      dispatch(showError(`Fence Mission Message failed to send`));
    }
  };

  const handleSplitMission = async () => {
    // const coords = features.filter((item) => item.type === 'points');
    // const points = coords.map((coord) => coord.points[0]);
    // if (coords.length === 0) {
    //   showError('There is No Point in the map for Searching Area');
    //   return;
    // }

    const featuresInMap = selectedFeatureIds.map((i) => {
      return getFeatureBySelected(i);
    });

    if (featuresInMap.length == 0) {
      showError('Select the Polygon or a Point in the Map');
      return;
    }

    try {
      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message: 'groupsplit',
        ids: selectedUAVIds,
        features: featuresInMap,
        ...socketData,
      });
      if (Boolean(res?.body?.message)) {
        dispatch(
          showNotification({
            message: `split Mission Message sent`,
            semantics: MessageSemantics.SUCCESS,
          })
        );
      }
      if (res?.body?.message[0]?.length == 0) {
        dispatch(
          showNotification({
            message: `Read a Empty Mission`,
            semantics: MessageSemantics.WARNING,
          })
        );
        return;
      }
      dispatch(setMissionFromServer(res.body.message));
      dispatch(
        showNotification({
          message: `${res.body.message[0].length}`,
          semantics: MessageSemantics.WARNING,
        })
      );
    } catch (e) {
      dispatch(showError(`Split Mission Message failed to send`));
    }
  };

  const camhandleMsg = async (msg) => {
    try {
      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message: msg,
        id: selectedUAVIds,
      });
      if (Boolean(res?.body?.message)) {
        dispatch(
          showNotification({
            message: `${msg} Message sent`,
            semantics: MessageSemantics.SUCCESS,
          })
        );
      }
    } catch (e) {
      dispatch(showError(`${msg} Message failed to send`));
    }
  };

  const handleMsg = async (msg) => {
    if (msg === 'add_link' || msg === 'remove_link') {
      if (selectedUAVIds.length > 1) {
        dispatch(showError(`Warning only one UAV able to Remove or Add`));
        return;
      }
    }

    try {
      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message: msg,
        id: selectedUAVIds[0],
      });
      if (Boolean(res?.body?.message)) {
        dispatch(
          showNotification({
            message: `${msg} Message sent`,
            semantics: MessageSemantics.SUCCESS,
          })
        );
      }
    } catch (e) {
      dispatch(showError(`${msg} Message failed to send`));
    }
  };

  const handleAntennaPoint = async (msg) => {
    try {
      const featureId = selectedFeatureIds[0];
      console.log('selectedFeatureIds', selectedFeatureIds, featureId);
      const data = getFeatureBySelected(featureId);

      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message: msg,
        id: selectedUAVIds[0],
        coords: data.points,
        ...socketData,
      });
      console.log(res);

      if (Boolean(res?.body?.message)) {
        dispatch(
          showNotification({
            message: `${msg} Message sent`,
            semantics: MessageSemantics.SUCCESS,
          })
        );
        dispatch(changeAntennaBearing({ bearing: parseInt(res?.body?.angle) }));
      }
    } catch (e) {
      dispatch(showError(`${msg} Message failed to send`));
    }
  };

  const handlePoint = async (message) => {
    if (selectedFeatureIds.length === 0) {
      dispatch(showError(`${message} needs a path or point`));
      return;
    }
    const featureId = selectedFeatureIds[0];
    console.log('selectedFeatureIds', selectedFeatureIds, featureId);
    const data = getFeatureBySelected(featureId);
    try {
      console.log('data.points', data);
      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message,
        ids: selectedUAVIds,
        coords: data.points,
        // features: featuresInMap,
        ...socketData,
      });

      if (Boolean(res.body.message)) {
        dispatch(
          showNotification({
            message: `${message} Message sent`,
            semantics: MessageSemantics.SUCCESS,
          })
        );
      } else {
        dispatch(showError(`${message} failed to send - out of boundary`));
      }

      if (message == 'search' || message == 'navigate') {
        if (res?.body?.message[0]?.length == 0) {
          dispatch(
            showNotification({
              message: `Read a Empty Mission`,
              semantics: MessageSemantics.WARNING,
            })
          );
          return;
        }
        dispatch(setMissionFromServer(res.body.message));
        dispatch(setTime(res.body.time?.toFixed(2)));
      }
    } catch (e) {
      dispatch(
        showNotification({
          message: `${message} ${e?.message} Command is Failed`,
          semantics: MessageSemantics.ERROR,
        })
      );
    }
  };

  return (
    <Box style={{ margin: 10, gap: 20 }}>
      <FormGroup style={{ display: 'flex', flexDirection: 'row', gap: 15 }}>
        <Box style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {/*<FormControl fullWidth variant='standard'>*/}
          {/*  <Button*/}
          {/*    variant='contained'*/}
          {/*    onClick={async () => await handleMsg('master')}*/}
          {/*    disabled={selectedUAVIds?.length !== 1}*/}
          {/*  >*/}
          {/*    Master*/}
          {/*  </Button>*/}
          {/*</FormControl>*/}
          {/*<FormControl fullWidth variant='standard'>*/}
          {/*  <label onClick={() => setEditing(true)}>*/}
          {/*    <ListItem button>*/}
          {/*      Choose Runway: {val.location} {val.runwayName}*/}
          {/*    </ListItem>*/}
          {/*  </label>*/}
          {/*  <DraggableDialog*/}
          {/*    fullWidth*/}
          {/*    open={editing}*/}
          {/*    maxWidth='sm'*/}
          {/*    title='Choose Runway'*/}
          {/*    onClose={() => {*/}
          {/*      setVal((prev) => {*/}
          {/*        return {*/}
          {/*          ...prev,*/}
          {/*          location: '',*/}
          {/*          runwayName: '',*/}
          {/*        };*/}
          {/*      });*/}
          {/*      setEditing(false);*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <DialogContent>*/}
          {/*      <FormGroup>*/}
          {/*        <FormControl fullWidth variant='standard'>*/}
          {/*          <InputLabel id='location'>Location:</InputLabel>*/}
          {/*          <Select*/}
          {/*            fullWidth*/}
          {/*            value={val.location}*/}
          {/*            onChange={({ target: { value } }) => {*/}
          {/*              setVal((prev) => {*/}
          {/*                return {*/}
          {/*                  ...prev,*/}
          {/*                  location: value,*/}
          {/*                };*/}
          {/*              });*/}
          {/*            }}*/}
          {/*          >*/}
          {/*            {swarm_location.map((loc) => (*/}
          {/*              <MenuItem value={loc}>{loc}</MenuItem>*/}
          {/*            ))}*/}
          {/*          </Select>*/}
          {/*        </FormControl>*/}
          {/*        <FormControl*/}
          {/*          fullWidth*/}
          {/*          variant='filled'*/}
          {/*          style={{ marginTop: 5 }}*/}
          {/*        >*/}
          {/*          <FormLabel id='runway' style={{ marginTop: 20 }}>*/}
          {/*            Select position*/}
          {/*          </FormLabel>*/}
          {/*          <RadioGroup aria-labelledby='runway' row>*/}
          {/*            {runway?.length != 0 &&*/}
          {/*              runway.map((item) => (*/}
          {/*                <FormControlLabel*/}
          {/*                  label={item}*/}
          {/*                  value={item}*/}
          {/*                  control={<Radio checked={val.runwayName == item} />}*/}
          {/*                  onChange={() => {*/}
          {/*                    setVal((prev) => {*/}
          {/*                      return {*/}
          {/*                        ...prev,*/}
          {/*                        runwayName: item,*/}
          {/*                      };*/}
          {/*                    });*/}
          {/*                  }}*/}
          {/*                />*/}
          {/*              ))}*/}
          {/*          </RadioGroup>*/}
          {/*        </FormControl>*/}
          {/*        <Button*/}
          {/*          variant='contained'*/}
          {/*          disabled={!(val.location != '' && val.runwayName != '')}*/}
          {/*          onClick={() => {*/}
          {/*            setEditing(false);*/}
          {/*            handleMsg('plot');*/}
          {/*          }}*/}
          {/*        >*/}
          {/*          Submit*/}
          {/*        </Button>*/}
          {/*      </FormGroup>*/}
          {/*    </DialogContent>*/}
          {/*  </DraggableDialog>*/}
          {/*</FormControl>*/}
        </Box>

        {/* <Box style={{ display: 'flex', gap: 5 }}>
          <Button
            variant='contained'
            onClick={camhandleMsg.bind(this, 'start_capture')}
          >
            Start Capture
          </Button>
          <Button
            variant='contained'
            onClick={camhandleMsg.bind(this, 'stop_capture')}
          >
            Stop Capture
          </Button>
        </Box> */}

        <Box style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <FormControl
            fullWidth
            variant='standard'
            style={{ display: 'flex', flexDirection: 'row', gap: 10 }}
          >
            <Button
              variant='contained'
              onClick={async () => await handlePoint('navigate')}
            >
              Navigation
            </Button>
            {/*<Button variant='contained' onClick={async () => await handleMsg('clear_csv')}>*/}
            {/*  Clear CSV*/}
            {/*</Button>*/}
            <Button variant='contained' onClick={handleMsg.bind(this, 'home')}>
              Home
            </Button>
          </FormControl>
        </Box>
        <Box style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <FormControl
            fullWidth
            variant='standard'
            style={{ display: 'flex', flexDirection: 'row', gap: 10 }}
          >
            {/*<Button variant='contained' onClick={async () => await handlePoint('loiter')}>*/}
            {/*  Loiter Point*/}
            {/*</Button>*/}
            <Button
              variant='contained'
              onClick={async () => await handlePoint('goal')}
            >
              Goal Point
            </Button>
            <Button
              variant='contained'
              onClick={async () => await handleMsg('stop')}
              // disabled={selectedUAVIds?.length !== 1}
            >
              Stop Mission
            </Button>
            {/* <Button
              variant='contained'
              onClick={async () => await handleMsg('offline')}
            >
              Offline
            </Button> */}

            {/* <Button */}
            {/* variant='contained' */}
            {/* onClick={as ync () => await handlePoint('land')} */}
            {/* > */}
            {/* Land */}
            {/* </Button> */}
            <Button
              variant='contained'
              onClick={async () => await handleMsg('disperse')}
            >
              Disperse
            </Button>
            <Button
              variant='contained'
              onClick={() => handlePoint('aggregate')}
              // disabled={selectedUAVIds.length === 0}
            >
              Aggregate
            </Button>
            <Button
              variant='contained'
              onClick={handleFenceMission}
              // disabled={selectedUAVIds.length === 0}
            >
              Geo Fence
            </Button>
          </FormControl>
        </Box>
        <Box
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'center',
          }}
        >
          <FormControl
            fullWidth
            variant='standard'
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
            }}
          >
            {/*<Button variant='contained' onClick={async () => await handleMsg('share_data')}>*/}
            {/*  share data*/}
            {/*</Button>*/}
            {/*<Button variant='contained' onClick={async () => await handleMsg('home_lock')}>*/}
            {/*  Home Lock*/}
            {/*</Button>*/}
            <Button
              variant='contained'
              disabled={selectedUAVIds.length === 0}
              onClick={async () => await handleMsg('add_link')}
            >
              Include UAV
            </Button>
            <Button
              variant='contained'
              disabled={selectedUAVIds.length === 0}
              onClick={async () => await handleMsg('remove_link')}
            >
              Exclude UAV
            </Button>
            <Button
              variant='contained'
              onClick={() => dispatch(onOpen())}
              // disabled={selectedUAVIds.length === 0}
            >
              Open Group
            </Button>

            <Button
              variant='contained'
              onClick={() => dispatch(DownloadMissionTrue())}
            >
              show Trajectory
            </Button>
            <Button
              variant='contained'
              onClick={async () => await handleMsg('Home Goto')}
            >
              Home Goto
            </Button>
            {/* Estimated time: {socketData.time} minutes */}
          </FormControl>
        </Box>
        <Box
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'center',
          }}
        >
          {/*<FormControl*/}
          {/*  variant='standard'*/}
          {/*  style={{display: 'flex', flexDirection: 'row', gap: 10}}*/}
          {/*>*/}
          {/*  <InputLabel id='goal'>Skip Waypoit</InputLabel>*/}
          {/*  <Input*/}
          {/*    id='goal'*/}
          {/*    value={socketData.skip_waypoint}*/}
          {/*    type='number'*/}
          {/*    onChange={({target: {value}}) => dispatch(changeWayPoint({waypoint:parseInt(value)}))}*/}
          {/*  />*/}
          {/*</FormControl>*/}
          {/*<Button*/}
          {/*  variant='contained'*/}
          {/*  onClick={async () => await handlePoint('skip')}*/}
          {/*>*/}
          {/*  Skip*/}
          {/*</Button>*/}
          {/*<FormControl*/}
          {/*  variant='standard'*/}
          {/*  style={{display: 'flex', flexDirection: 'row', gap: 10}}*/}
          {/*>*/}
          {/*  <InputLabel id='alt'>Alt</InputLabel>*/}
          {/*  <Input*/}
          {/*    id='alt'*/}
          {/*    value={val.alt}*/}
          {/*    type='number'*/}
          {/*    onChange={({target: {value}}) => {*/}
          {/*      setVal((prev) => {*/}
          {/*        return {...prev, alt: parseInt(value)};*/}
          {/*      });*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</FormControl>*/}
          {/*<FormControl>*/}
          {/*  <InputLabel id='alt_diff'>Different Alt</InputLabel>*/}
          {/*  <Input*/}
          {/*    id='alt_diff'*/}
          {/*    value={val.alt_diff}*/}
          {/*    type='number'*/}
          {/*    onChange={({target: {value}}) => {*/}
          {/*      setVal((prev) => {*/}
          {/*        return {...prev, alt_diff: parseInt(value)};*/}
          {/*      });*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</FormControl>*/}
          {/*<Button variant='contained' onClick={handleAlt} disabled={!val.alt}>*/}
          {/*  Set Alt*/}
          {/*</Button>*/}
          <FormControl variant='standard'>
            <InputLabel htmlFor='coverage'>Coverage in Meters</InputLabel>
            <Input
              name='coverage'
              type='number'
              inputMode='numeric'
              inputProps={{ id: 'coverage' }}
              value={socketData.coverage}
              onChange={({ target: { value, name } }) =>
                dispatch(changeCoverage({ coverage: parseInt(value) }))
              }
            />
          </FormControl>
          <FormControl variant='standard'>
            <InputLabel htmlFor='camAlt'>Camera Altitude</InputLabel>
            <Input
              name='camAlt'
              type='number'
              inputMode='numeric'
              inputProps={{ id: 'camAlt' }}
              value={socketData.camAlt}
              onChange={({ target: { value, name } }) =>
                dispatch(changeCamAlt({ camAlt: parseInt(value) }))
              }
            />
          </FormControl>
          <FormControl variant='standard'>
            <InputLabel htmlFor='overlap'>Overlap Percentage</InputLabel>
            <Input
              name='overlap'
              type='number'
              inputMode='numeric'
              inputProps={{ id: 'overlap' }}
              value={socketData.overlap}
              onChange={({ target: { value, name } }) =>
                dispatch(changeOverlap({ overlap: parseInt(value) }))
              }
            />
          </FormControl>
          <FormControl variant='standard'>
            <InputLabel htmlFor='zoomLevel'>Zoom Level of camera</InputLabel>
            <Input
              name='zoomLevel'
              type='number'
              inputMode='numeric'
              inputProps={{ id: 'zoomLevel' }}
              value={socketData.zoomLevel}
              onChange={({ target: { value, name } }) =>
                dispatch(changeZoomLevel({ zoomLevel: parseInt(value) }))
              }
            />
          </FormControl>
          {/*<Button variant='contained' onClick={async () => await handleMsg('stop')}>*/}
          {/*  Stop*/}
          {/*</Button>*/}
          <Button
            variant='contained'
            onClick={async () => await handlePoint('search')}
          >
            Search
          </Button>

          <Button
            variant='contained'
            onClick={handleSplitMission}
            disabled={selectedUAVIds.length === 0}
          >
            Split Group
          </Button>
        </Box>
        {/* <FormControl
          fullWidth
          style={{ display: 'flex', flexDirection: 'row', gap: 10 }}
        > */}
        {/*<Button variant='contained' onClick={async () => await handleMsg('remove_uav')}>*/}
        {/*  Remove Uav*/}
        {/*</Button>*/}
        {/*<Button variant='contained' onClick={async () => await handleMsg('payload')}>*/}
        {/*  Release Payload*/}
        {/*</Button>*/}
        {/* <Button
            variant='contained'
            onClick={() => dispatch(DownloadMissionTrue())}
          >
            show Trajectory
          </Button>
          <Button
            variant='contained'
            onClick={async () => await handleMsg('Home Goto')}
          >
            Home Goto
          </Button> */}
        {/* <p>{antennaBearing.antBear} deg</p> */}
        {/* </FormControl> */}
      </FormGroup>
    </Box>
  );
};

SwarmPanel.propTypes = {
  selectedUAVIds: PropTypes.arrayOf(PropTypes.string),
  selectedFeatureIds: PropTypes.arrayOf(PropTypes.string),
  getFeatureBySelected: PropTypes.func,
  antennaBearing: PropTypes.string,
  socketData: PropTypes.object,
  landingFeature: PropTypes.func,
};

export default connect(
  // mapStateToProps
  (state) => ({
    selectedUAVIds: getSelectedUAVIds(state),
    selectedFeatureIds: getSelectedFeatureIds(state),
    features: getFeaturesInOrder(state),
    getFeatureBySelected: (featureId) => getFeatureById(state, featureId),
    landingFeature: () => {
      const landingMissionId = getLandingMissionId(state);
      const landingFeature = getFeatureById(state, landingMissionId);
      if (landingFeature === undefined) return [];
      return landingFeature?.points;
    },
    socketData: {
      ...state.socket,
    },
    antennaBearing: {
      antBear: state.socket.antennaBearing,
    },
    connection: getCurrentServerState(state).state,
  }),
  // mapDispatchToProps
  (dispatch) => ({
    dispatch,
    onOpen: openGroupSplitDialog,
  })
)(withTranslation()(SwarmPanel));
