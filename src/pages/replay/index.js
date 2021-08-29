import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import styled from 'styled-components';
import { Paper } from 'components/Paper';
import Layout from 'components/Layout';
import Recplayer from 'components/Recplayer';
import { Level } from 'components/Names';
import LocalTime from 'components/LocalTime';
import Kuski from 'components/Kuski';
import Time from 'components/Time';
import Link from 'components/Link';
import Header from 'components/Header';
import RecList from 'features/RecList';
import { useLocation } from '@reach/router';
import queryString from 'query-string';
import ReplayComments from 'features/ReplayComments';
import ReplayRating from 'features/ReplayRating';
import AddComment from 'components/AddComment';
import Tags from 'components/Tags';
import Loading from 'components/Loading';
import { useStoreState, useStoreActions } from 'easy-peasy';
import config from 'config';
import ReplaySettings from 'features/ReplaySettings';
import { TextField } from 'components/Inputs';
import FieldBoolean from 'components/FieldBoolean';
import Button from 'components/Buttons';

const Replay = ({ ReplayUuid, RecFileName }) => {
  const isWindow = typeof window !== 'undefined';
  let link = '';
  let linkArray = [];
  let uuidarray = [];
  const location = useLocation();
  const { merge } = queryString.parse(location.search);

  const { getReplayByUUID, setEdit, submitEdit } = useStoreActions(
    state => state.ReplayByUUID,
  );
  const { userid } = useStoreState(state => state.Login);
  const { replay, loading, replays, edit } = useStoreState(
    state => state.ReplayByUUID,
  );
  const {
    settings: { theater },
  } = useStoreState(state => state.ReplaySettings);

  useEffect(() => {
    if (ReplayUuid) {
      getReplayByUUID({ ReplayUuid, merge, RecFileName });
    }
  }, [ReplayUuid, merge]);

  if (!RecFileName && replay && replay.UUID === ReplayUuid) {
    window.history.replaceState(
      '',
      '',
      `${location.href}/${replay.RecFileName.replace('.rec', '')}`,
    );
  }

  if (
    !replay ||
    (replay?.RecFileName.replace('.rec', '') !== RecFileName && RecFileName)
  )
    return (
      <Layout t={`rec - ${ReplayUuid}`}>
        {loading ? <Loading /> : <div>not found</div>}
      </Layout>
    );

  if (isWindow) {
    if (replay.UUID.substring(0, 5) === 'local') {
      link = `${config.url}temp/${replay.UUID}-${replay.RecFileName}`;
    } else {
      link = `${config.s3Url}replays/${replay.UUID}/${replay.RecFileName}`;
      uuidarray.push(replay.UUID);
      if (replays.length > 0) {
        uuidarray = [];
        replays.forEach(r => {
          linkArray.push(`${config.s3Url}replays/${r.UUID}/${r.RecFileName}`);
          uuidarray.push(r.UUID);
        });
        link = linkArray.join(';');
      }
    }
  }

  const getTags = () => {
    return replay.Tags.map(tag => tag.Name);
  };

  return (
    <Layout t={`rec - ${replay.RecFileName}`}>
      <PlayerContainer theater={theater}>
        <Player>
          {isWindow && (
            <Recplayer
              rec={link}
              lev={`${config.dlUrl}level/${replay.LevelIndex}`}
              controls
            />
          )}
        </Player>
        <ReplaySettings />
      </PlayerContainer>
      <RightBarContainer>
        <ChatContainer>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Header h3>
                <>{replay.RecFileName}</>
              </Header>
            </AccordionSummary>
            <AccordionDetails style={{ flexDirection: 'column' }}>
              <ReplayDescription>
                <div>
                  {isWindow ? (
                    <>
                      <a href={link}>
                        <Time thousands time={replay.ReplayTime} />
                      </a>{' '}
                    </>
                  ) : (
                    <Time thousands time={replay.ReplayTime} />
                  )}
                  by{' '}
                  {replay.DrivenByData ? (
                    <Kuski kuskiData={replay.DrivenByData} />
                  ) : (
                    replay.DrivenByText || 'Unknown'
                  )}{' '}
                  in <Level LevelData={replay.LevelData} noLink />
                </div>
                <br />
                <Link to={`/levels/${replay.LevelIndex}`}>
                  Go to level page
                </Link>
              </ReplayDescription>
              <Tags tags={getTags()} />
            </AccordionDetails>
          </Accordion>
          {/* <ExpansionPanel defaultExpanded>
            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
              <Header h3>
                <React.Fragment>
                  <Level LevelData={replay.LevelData} noLink/>.lev
                </React.Fragment>
              </Header>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
              <div>1. Zweq 01:22,49</div>
              <div>2. Zero 01:30,33</div>
              <div>3. talli 01:32,95</div>
              <div>etc.</div>
            </ExpansionPanelDetails>
          </ExpansionPanel> */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Header h3>Other replays in level</Header>
            </AccordionSummary>
            <AccordionDetails style={{ flexDirection: 'column' }}>
              <RecList
                LevelIndex={replay.LevelIndex}
                currentUUID={uuidarray}
                columns={['Replay', 'Time', 'By']}
                horizontalMargin={-16}
                mergable
              />
            </AccordionDetails>
          </Accordion>
          {userid === `${replay.UploadedBy}` && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Header h3>Edit replay</Header>
              </AccordionSummary>
              <AccordionDetails style={{ flexDirection: 'column' }}>
                <TextField
                  name="Comment"
                  value={edit.Comment}
                  onChange={value => setEdit({ field: 'Comment', value })}
                />
                <TextField
                  name="Driven by"
                  value={edit.DrivenBy}
                  onChange={value => setEdit({ field: 'DrivenBy', value })}
                />
                <FieldBoolean
                  label="Unlisted"
                  value={edit.Unlisted}
                  onChange={() =>
                    setEdit({ field: 'Unlisted', value: 1 - edit.Unlisted })
                  }
                />
                <Button
                  onClick={() =>
                    submitEdit({ edit, ReplayUuid, merge, RecFileName })
                  }
                >
                  Edit
                </Button>
              </AccordionDetails>
            </Accordion>
          )}
        </ChatContainer>
      </RightBarContainer>
      <LevelStatsContainer>
        <ReplayDescriptionPaper>
          <div>
            <div>{replay.Comment}</div>
            <BattleTimestamp>
              Uploaded by{' '}
              {replay.UploadedByData ? replay.UploadedByData.Kuski : 'Unknown'}{' '}
              <LocalTime
                date={replay.Uploaded}
                format="YYYY-MM-DD HH:mm:ss"
                parse="X"
              />
            </BattleTimestamp>
          </div>
          <ReplayRating ReplayIndex={replay.ReplayIndex} />
        </ReplayDescriptionPaper>
      </LevelStatsContainer>
      <LevelStatsContainer>
        <BattleDescriptionPaper>
          <AddComment add={() => {}} type="replay" index={replay.ReplayIndex} />
          <ReplayComments ReplayIndex={replay.ReplayIndex} />
        </BattleDescriptionPaper>
      </LevelStatsContainer>
    </Layout>
  );
};

const PlayerContainer = styled.div`
  width: ${p => (p.theater ? '100%' : '70%')};
  float: left;
  padding: 7px;
  box-sizing: border-box;
  @media (max-width: 1100px) {
    float: none;
    width: 100%;
  }
`;

const Player = styled.div`
  background: ${p => p.theme.pageBackground};
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  @media screen and (max-width: 1100px) {
    height: 56vw;
    min-height: 450px;
  }
`;

const RightBarContainer = styled.div`
  float: right;
  width: 30%;
  padding: 7px;
  box-sizing: border-box;
  @media (max-width: 1100px) {
    float: none;
    width: 100%;
  }
`;

const LevelStatsContainer = styled.div`
  width: 70%;
  float: left;
  padding: 7px;
  box-sizing: border-box;
  @media (max-width: 1100px) {
    float: none;
    width: 100%;
  }
`;

const BattleDescriptionPaper = styled(Paper)`
  font-size: 14px;
  padding: 7px;
  width: auto;
`;

const ReplayDescriptionPaper = styled(Paper)`
  font-size: 14px;
  padding: 7px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: auto;
`;

const ReplayDescription = styled.div`
  font-size: 14px;
`;

const BattleTimestamp = styled.div`
  color: #7d7d7d;
`;

const ChatContainer = styled.div`
  clear: both;
`;

Replay.propTypes = {
  ReplayUuid: PropTypes.string,
};

Replay.defaultProps = {
  ReplayUuid: '',
};

export default Replay;
