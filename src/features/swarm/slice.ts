import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { noPayload } from '~/utils/redux';

type Group = {
  [k: string]: string[];
};
interface SwarmSlice {
  coverage: number;
  simLocation: string;
  simPattern: string;
  UAVRow: number;
  UAVColumn: number;
  UAVSpacing: number;
  NoOfUAVs: number;
  camAlt: number;
  gridSpacing: number;
  overlap: number;
  zoomLevel: number;
  Direction: string;
  skip_waypoint: number;
  radius: number;
  speed: number;
  groupsplitDialog: boolean;
  numOfGroups: number;
  cameraYaw: number;
  cameraLattitude: number;
  cameraLongitiude: number;
  antennaBearing: number;
  cameraTargetLattitude: number;
  cameraTargetLongititude: number;
  selectedCameraip: string;
  group: Group;
  selectedTab: 'Create' | 'Delete' | 'View Groups';
  time: number;
  timerRunning: boolean;
}

const initialState: SwarmSlice = {
  coverage: 500,
  simPattern: 'Line',
  simLocation: '12.934812, 80.050174',
  NoOfUAVs: 1,
  UAVSpacing: 10,
  UAVRow: NaN,
  UAVColumn: NaN,
  camAlt: 100,
  gridSpacing: 50,
  overlap: 10,
  zoomLevel: 1,
  antennaBearing: 0,
  cameraYaw: 0,
  selectedCameraip: '0:0:0:0',
  Direction: 'ClockWise Direction',
  cameraLattitude: 0.0,
  cameraLongitiude: 0.0,
  cameraTargetLattitude: 13.0505301,
  cameraTargetLongititude: 80.2120814,
  skip_waypoint: 0,
  radius: 0,
  speed: 18,
  groupsplitDialog: false,
  numOfGroups: 0,
  group: {},
  selectedTab: 'Create',
  time: 0,
  timerRunning: false,
};

const { actions, reducer } = createSlice({
  name: 'socketswarm',
  initialState,
  reducers: {
    updateCameraYaw(state, action: PayloadAction<{ yaw: number }>) {
      state.cameraYaw = action.payload.yaw;
    },
    changeCameraLocation(
      state,
      action: PayloadAction<{ lat: number; lon: number }>
    ) {
      state.cameraLattitude = action.payload.lat;
      state.cameraLongitiude = action.payload.lon;
    },
    changeCameraTargetLocation(
      state,
      action: PayloadAction<{ lat: number; lon: number }>
    ) {
      state.cameraTargetLattitude = action.payload.lat;
      state.cameraTargetLongititude = action.payload.lon;
    },
    changeSelectedCameraIp(
      state,
      action: PayloadAction<{ selectedCameraIp: string }>
    ) {
      state.selectedCameraip = action.payload.selectedCameraIp;
    },
    changeAntennaBearing(state, action: PayloadAction<{ bearing: number }>) {
      state.antennaBearing = action.payload.bearing;
    },
    changeNoUAVs(state, action: PayloadAction<{ NoOfUAVs: number }>) {
      state.NoOfUAVs = action.payload.NoOfUAVs;
    },
    changesimLocation(state, action: PayloadAction<{ simLocation: string }>) {
      state.simLocation = action.payload.simLocation;
    },
    changeUavSpacing(state, action: PayloadAction<{ UAVSpacing: number }>) {
      state.UAVSpacing = action.payload.UAVSpacing;
    },
    changeUavRow(state, action: PayloadAction<{ UAVRow: number }>) {
      state.UAVRow = action.payload.UAVRow;
    },
    changeUavColumn(state, action: PayloadAction<{ UAVColumn: number }>) {
      state.UAVColumn = action.payload.UAVColumn;
    },
    changeCoverage(state, action: PayloadAction<{ coverage: number }>) {
      state.coverage = action.payload.coverage;
    },
    changeCamAlt(state, action: PayloadAction<{ camAlt: number }>) {
      state.camAlt = action.payload.camAlt;
    },
    changeOverlap(state, action: PayloadAction<{ overlap: number }>) {
      state.overlap = action.payload.overlap;
    },
    changeZoomLevel(state, action: PayloadAction<{ zoomLevel: number }>) {
      state.zoomLevel = action.payload.zoomLevel;
    },
    changeDirection(state, action: PayloadAction<{ direction: string }>) {
      state.Direction = action.payload.direction;
    },
    changeWayPoint(state, action: PayloadAction<{ waypoint: number }>) {
      state.skip_waypoint = action.payload.waypoint;
    },
    changeRadius(state, action: PayloadAction<{ radius: number }>) {
      state.radius = action.payload.radius;
    },
    changeSimPattern(state, action: PayloadAction<{ simPattern: string }>) {
      state.simPattern = action.payload.simPattern;
    },

    changeSpeed(state, action: PayloadAction<{ speed: number }>) {
      state.speed = action.payload.speed;
    },
    openGroupSplitDialog: noPayload<SwarmSlice>((state) => {
      state.groupsplitDialog = true;
    }),
    closeGroupSplitingDialog: noPayload<SwarmSlice>((state) => {
      state.groupsplitDialog = false;
    }),
    addGroup: (
      state,
      action: PayloadAction<{ id: string; uavs: string[] }>
    ) => {
      state.group[action.payload.id] = action.payload.uavs;
    },
    changeSelectedTab: (
      state,
      action: PayloadAction<SwarmSlice['selectedTab']>
    ) => {
      state.selectedTab = action.payload;
    },
    resetGroup: noPayload<SwarmSlice>((state) => {
      state.group = {};
    }),
    deleteGroup: (state, action: PayloadAction<string>) => {
      delete state.group[action.payload];
    },
    setTime: (state, actions: PayloadAction<number>) => {
      state.time = actions.payload;
    },
    setTimerRunning: (state, action: PayloadAction<boolean>) => {
      state.timerRunning = action.payload;
    },
  },
});

export const {
  changeWayPoint,
  changeDirection,
  changeCameraTargetLocation,
  changeSelectedCameraIp,
  changeAntennaBearing,
  changeCameraLocation,
  updateCameraYaw,
  changeCoverage,
  changeNoUAVs,
  changeUavSpacing,
  changeUavColumn,
  changeUavRow,
  changeSimPattern,
  changeCamAlt,
  changeOverlap,
  changeZoomLevel,
  changesimLocation,
  changeRadius,
  changeSpeed,
  openGroupSplitDialog,
  closeGroupSplitingDialog,
  addGroup,
  changeSelectedTab,
  resetGroup,
  setTime,
  setTimerRunning,
} = actions;

export default reducer;
