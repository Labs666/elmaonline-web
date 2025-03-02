import React from 'react';
import styled from 'styled-components';
import { format, formatDistance } from 'date-fns';
import LocalTime from 'components/LocalTime';
import Kuski from 'components/Kuski';
import Download from 'components/Download';
import { Paper } from 'components/Paper';
import { Timer } from '@material-ui/icons';
import Link from 'components/Link';

const eventSort = (a, b) => a.CupIndex - b.CupIndex;

const CupResults = props => {
  const { events, ShortName } = props;

  const currentEvents = events.filter(
    e =>
      e.EndTime > format(new Date(), 't') &&
      e.StartTime < format(new Date(), 't'),
  );

  const getEventNumber = event => {
    const index = events
      .sort(eventSort)
      .findIndex(e => e.CupIndex === event.CupIndex);
    return index + 1;
  };

  return (
    <Container>
      {currentEvents.map(c => {
        const timesShown =
          c.Level && c.Level.Hidden !== undefined && !c.Level.Hidden;

        return (
          <Paper key={c.LevelIndex}>
            <EventHeader>
              <Link to={`/cup/${ShortName}/events/${getEventNumber(c)}/map`}>
                Event {getEventNumber(c)}
              </Link>
              <span> by </span>
              <Kuski kuskiData={c.KuskiData} />
            </EventHeader>
            <EventInfo>
              {c.Level && (
                <span title="Download level">
                  <Download href={`level/${c.LevelIndex}`}>
                    {c.Level.LevelName}.lev
                  </Download>
                </span>
              )}
              {c.Level && timesShown && (
                <Link
                  title="Go to level page; times for this event are shown."
                  to={`/levels/${c.LevelIndex}`}
                >
                  {' - '}level page
                </Link>
              )}
            </EventInfo>
            <EventInfo>
              Deadline:{' '}
              <LocalTime
                date={c.EndTime}
                format="ddd D MMM YYYY HH:mm"
                parse="X"
              />
            </EventInfo>
            <EventInfo>
              <Timer />{' '}
              {formatDistance(new Date(c.EndTime * 1000), new Date(), {
                addSuffix: true,
              })}
            </EventInfo>
          </Paper>
        );
      })}
    </Container>
  );
};

const Container = styled.div``;

const EventHeader = styled.div`
  text-align: center;
  padding-top: 8px;
  font-weight: bold;
`;

const EventInfo = styled.div`
  text-align: center;
  padding-bottom: 8px;
`;

export default CupResults;
