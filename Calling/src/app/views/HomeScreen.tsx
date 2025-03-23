// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { Stack, PrimaryButton, Image, ChoiceGroup, IChoiceGroupOption, Text, TextField } from '@fluentui/react';
import { Label } from '@fluentui/react';
import { registerIcons, Callout, mergeStyles, Link } from '@fluentui/react';
import heroSVG from '../../assets/hero.svg';
import {
  imgStyle,
  infoContainerStyle,
  callContainerStackTokens,
  callOptionsGroupStyles,
  configContainerStyle,
  configContainerStackTokens,
  containerStyle,
  containerTokens,
  headerStyle,
  teamsItemStyle,
  buttonStyle
} from '../styles/HomeScreen.styles';
import { outboundTextField } from '../styles/HomeScreen.styles';
import {
  dialpadOptionStyles,
  alternateCallerIdCalloutStyles,
  alternateCallerIdCalloutTitleStyles,
  alternateCallerIdCalloutLinkStyles
} from '../styles/HomeScreen.styles';
import { ThemeSelector } from '../theming/ThemeSelector';
import { localStorageAvailable } from '../utils/localStorage';
import { getDisplayNameFromLocalStorage, saveDisplayNameToLocalStorage } from '../utils/localStorage';
import { DisplayNameField } from './DisplayNameField';
import { RoomLocator, TeamsMeetingLinkLocator } from '@azure/communication-calling';
import { TeamsMeetingIdLocator } from '@azure/communication-calling';
import { getRoomIdFromUrl } from '../utils/AppUtils';
import { getIsCTE } from '../utils/AppUtils';
import { Dialpad } from '@azure/communication-react';
import { Backspace20Regular } from '@fluentui/react-icons';
import { useIsMobile } from '../utils/useIsMobile';
import { CallAdapterLocator } from '@azure/communication-react';

export type CallOption =
  | 'ACSCall'
  | 'TeamsMeeting'
  | 'Rooms'
  | 'StartRooms'
  | 'TeamsIdentity'
  | '1:N'
  | 'PSTN'
  | 'TeamsAdhoc';

export interface HomeScreenProps {
  startCallHandler(callDetails: {
    displayName: string;
    callLocator?: CallAdapterLocator | TeamsMeetingLinkLocator | RoomLocator | TeamsMeetingIdLocator;
    option?: CallOption;
    role?: string;
    outboundParticipants?: string[];
    alternateCallerId?: string;
    teamsToken?: string;
    teamsId?: string;
    outboundTeamsUsers?: string[];
  }): void;
  joiningExistingCall: boolean;
}

type ICallChoiceGroupOption = IChoiceGroupOption & { key: CallOption };

export const HomeScreen = (props: HomeScreenProps): JSX.Element => {
  const imageProps = { src: heroSVG.toString() };
  const headerTitle = props.joiningExistingCall ? 'Join Call' : 'Start or join a call!';
  const callOptionsGroupLabel = 'Select a call option';
  const buttonText = 'Next';
  const callOptions: ICallChoiceGroupOption[] = [
    { key: 'ACSCall', text: 'Start a call' },
    { key: 'StartRooms', text: 'Start a Rooms call' },
    { key: 'TeamsMeeting', text: 'Join a Teams meeting using ACS identity' },
    { key: 'Rooms', text: 'Join a Rooms Call' },
    { key: 'TeamsIdentity', text: 'Join a Teams call using Teams identity' },
    { key: '1:N', text: 'Start a 1:N ACS Call' },
    { key: 'PSTN', text: 'Start a PSTN Call' },
    { key: 'TeamsAdhoc', text: 'Call a Teams User or voice application' }
  ];
  const roomIdLabel = 'Room ID';
  const teamsTokenLabel = 'Enter a Teams token';
  const teamsIdLabel = 'Enter a Teams Id';
  const roomsRoleGroupLabel = 'Rooms Role';
  const roomRoleOptions: IChoiceGroupOption[] = [
    { key: 'Consumer', text: 'Consumer' },
    { key: 'Presenter', text: 'Presenter' },
    { key: 'Attendee', text: 'Attendee' }
  ];

  // Get display name from local storage if available
  const defaultDisplayName = localStorageAvailable ? getDisplayNameFromLocalStorage() : null;
  const [displayName, setDisplayName] = useState<string | undefined>(defaultDisplayName ?? undefined);
  const [chosenCallOption, setChosenCallOption] = useState(callOptions[0] as ICallChoiceGroupOption);
  const [callLocator, setCallLocator] = useState<TeamsMeetingLinkLocator | RoomLocator | TeamsMeetingIdLocator>();
  const [meetingId, setMeetingId] = useState<string>();
  const [passcode, setPasscode] = useState<string>();
  const [chosenRoomsRoleOption, setRoomsRoleOption] = useState<IChoiceGroupOption | undefined>(roomRoleOptions[1]);
  const [alternateCallerId, setAlternateCallerId] = useState<string>();
  const [outboundParticipants, setOutboundParticipants] = useState<string | undefined>();
  const [dialPadParticipant, setDialpadParticipant] = useState<string>();
  const [teamsToken, setTeamsToken] = useState<string>();
  const [teamsId, setTeamsId] = useState<string>();
  const [outboundTeamsUsers, setOutboundTeamsUsers] = useState<string | undefined>();
  const [alternateCallerIdCalloutVisible, setAlternateCallerIdCalloutVisible] = useState<boolean>(false);
  const startGroupCall: boolean = chosenCallOption.key === 'ACSCall';
  const teamsCallChosen: boolean = chosenCallOption.key === 'TeamsMeeting';
  const teamsIdentityChosen = chosenCallOption.key === 'TeamsIdentity';
  const pstnCallChosen: boolean = chosenCallOption.key === 'PSTN';
  const acsCallChosen: boolean = chosenCallOption.key === '1:N';
  const teamsAdhocChosen: boolean = chosenCallOption.key === 'TeamsAdhoc';
  const buttonEnabled =
    (displayName || teamsToken) &&
    (startGroupCall ||
      (teamsCallChosen && callLocator) ||
      (((chosenCallOption.key === 'Rooms' && callLocator) || chosenCallOption.key === 'StartRooms') &&
        chosenRoomsRoleOption) ||
      (pstnCallChosen && dialPadParticipant && alternateCallerId) ||
      (teamsAdhocChosen && outboundTeamsUsers) ||
      (outboundParticipants && acsCallChosen) ||
      (teamsIdentityChosen && callLocator && teamsToken && teamsId));

  registerIcons({ icons: { DialpadBackspace: <Backspace20Regular /> } });
  const isMobileSession = useIsMobile();
  const showDisplayNameField = !teamsIdentityChosen;
  const [teamsIdFormatError, setTeamsIdFormatError] = useState<boolean>(false);

  return (
    <Stack
      horizontal
      wrap
      horizontalAlign="center"
      verticalAlign="center"
      tokens={containerTokens}
      className={containerStyle}
    >
      <Image alt="Welcome to the ACS Calling sample app" className={imgStyle} {...imageProps} />
      <Stack className={infoContainerStyle}>
        <Text role={'heading'} aria-level={1} className={headerStyle}>
          {headerTitle}
        </Text>
        <Stack className={configContainerStyle} tokens={configContainerStackTokens}>
          {showDisplayNameField && <DisplayNameField defaultName={displayName} setName={setDisplayName} />}
          <PrimaryButton
            disabled={!buttonEnabled}
            className={buttonStyle}
            text={buttonText}
            onClick={() => {
              if (displayName || teamsIdentityChosen) {
                displayName && saveDisplayNameToLocalStorage(displayName);
                const acsParticipantsToCall = parseParticipants(outboundParticipants);
                const teamsParticipantsToCall = parseParticipants(outboundTeamsUsers);
                const dialpadParticipantToCall = parseParticipants(dialPadParticipant);
                props.startCallHandler({
                  //TODO: This needs to be updated after we change arg types of TeamsCall
                  displayName: !displayName ? 'Teams UserName PlaceHolder' : displayName,
                  callLocator: callLocator,
                  option: chosenCallOption.key,
                  role: chosenRoomsRoleOption?.key,
                  outboundParticipants: acsParticipantsToCall ? acsParticipantsToCall : dialpadParticipantToCall,
                  alternateCallerId,
                  teamsToken,
                  teamsId,
                  outboundTeamsUsers: teamsParticipantsToCall
                });
              }
            }}
          />
          <div>
            <ThemeSelector label="Theme" horizontal={true} />
          </div>
        </Stack>
      </Stack>
    </Stack>
  );
};

/**
 * splits the participant Id's so we can call multiple people.
 */
const parseParticipants = (participantsString?: string): string[] | undefined => {
  if (participantsString) {
    return participantsString.replaceAll(' ', '').split(',');
  } else {
    return undefined;
  }
};
