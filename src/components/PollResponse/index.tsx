import PollResponseForm from "./PollResponseForm"

const pollData = {
    pollId: 'abc123', // Replace with actual poll ID logic
    fields: [
      {
        fieldId: 'field1',
        label: 'Question 1',
        options: ['Option A', 'Option B', 'Option C'],
        settings: ''
      },
      {
        fieldId: 'field2',
        label: 'Question 2',
        options: ['Yes', 'No'],
        settings: ''
      }
      // Add more fields as needed
    ]
  };

export const PollResponse = () => {
    return <PollResponseForm pollData={pollData} onSubmit={() => {}} />
}