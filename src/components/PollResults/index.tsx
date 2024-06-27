import PollResultsTable from "./PollResultsTable"

const mockPollData = {
    pollId: 'abc123',
    fields: [
      {
        fieldId: 'field1',
        label: 'Question 1',
        options: ['Option A', 'Option B', 'Option C']
      },
      {
        fieldId: 'field2',
        label: 'Question 2',
        options: ['Yes', 'No']
      }
      // Add more fields as needed
    ]
  };

  const mockEvents = [
    {
      kind: 1069,
      tags: [
        ['e', 'abc123'],
        ['response', 'field1', 'Option A', '']
      ]
    },
    {
      kind: 1069,
      tags: [
        ['e', 'abc123'],
        ['response', 'field2', 'Yes', '']
      ]
    },
    {
      kind: 1069,
      tags: [
        ['e', 'abc123'],
        ['response', 'field1', 'Option B', '']
      ]
    },
    // Add more mock events as needed
];
export const PollResults = () => {
    return <PollResultsTable pollData={mockPollData} events={mockEvents} />
}