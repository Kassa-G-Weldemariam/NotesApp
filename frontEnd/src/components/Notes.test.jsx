import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Notes from './Notes'

test('render content', () => {
  const note = {
    content: 'component testing is done with react-testing-library',
    important: true,
  }

  render(<Notes note={note} />)

  const element = screen.getByText(
    'component testing is done with react-testing-library',
  )

  expect(element).toBeDefined()
//   screen.debug(element)

  // const { container } = render(<Notes note={note} />)
  // const div=container.querySelector('.note')
  // expect(div).toHaveTextContent('component testing is done with react-testing-library')

  
})
test('clicking the button calls event handler once', async () => {
  const note = {
    content: 'component testing is done with react-testing-library',
    important: true,
  }
  const mockHandler = vi.fn()

  render(<Notes note={note} toggleImportance={mockHandler} />)
  const user = userEvent.setup()
  const button = screen.getByText('make not important')
  await user.click(button)

  expect(mockHandler.mock.calls).toHaveLength(1)
})
