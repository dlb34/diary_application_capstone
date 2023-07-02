import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Container,
  Select
} from 'semantic-ui-react'

import { createDiary, deleteDiary, getDiarys, patchDiary, suscribeEmailSns } from '../api/diarys-api'
import Auth from '../auth/Auth'
import { Diary } from '../types/Diary'
import { GetDiarysRequest } from '../types/GetDiarysRequest'

interface DiarysProps {
  auth: Auth
  history: History
}

interface DiarysState {
  diarys: Diary[]
  newDiaryName: string
  loadingDiarys: boolean
  param: GetDiarysRequest
  nextKeyList: string[]
  emailaddr: string
}

const SIZE_PAGES_5 = [
  { key: '5', value: 5, text: '5' },
  { key: '10', value: 10, text: '10' },
  { key: '15', value: 100, text: '15' }
]

export class Diarys extends React.PureComponent<DiarysProps, DiarysState> {
  state: DiarysState = {
    diarys: [],
    newDiaryName: '',
    loadingDiarys: true,
    param: {
      nextKey: '',
      limit: 5
    },
    nextKeyList: [],
    emailaddr: ''
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newDiaryName: event.target.value })
  }

  handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ emailaddr: event.target.value })
  }

  onEditButtonClick = (diaryId: string) => {
    this.props.history.push(`/diarys/${diaryId}/edit`)
  }

  onDiaryCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newDiary = await createDiary(this.props.auth.getIdToken(), {
        name: this.state.newDiaryName,
        dueDate
      })
      this.setState({
        diarys: [...this.state.diarys, newDiary],
        newDiaryName: '',
        nextKeyList: [], 
        param: {
          ...this.state.param,
          nextKey: ''
        }
      })
    } catch {
      alert('diary creation failed')
    }
  }

  onCreateEmail = async  (event: React.ChangeEvent<HTMLButtonElement>) => {
    console.log("onEmailGenerate")
    await suscribeEmailSns(
        this.props.auth.getIdToken(), 
        this.state.emailaddr)
  }

  onDiaryDelete = async (diaryId: string) => {
    try {
      await deleteDiary(this.props.auth.getIdToken(), diaryId)
      this.setState({
        diarys: this.state.diarys.filter(diary => diary.diaryId !== diaryId)
      })
    } catch {
      alert('diary deletion failed')
    }
  }

  onDiaryCheck = async (pos: number) => {
    try {
      const diary = this.state.diarys[pos]
      await patchDiary(this.props.auth.getIdToken(), diary.diaryId, {
        name: diary.name,
        dueDate: diary.dueDate,
        done: !diary.done
      })
      this.setState({
        diarys: update(this.state.diarys, {
          [pos]: { done: { $set: !diary.done } }
        })
      })
    } catch {
      alert('diary deletion failed')
    }
  }

  handleNextClicking() {
    this.state.nextKeyList.push(this.state.param.nextKey);
    this.setState({ loadingDiarys: true });
  }

  handlePreviousClicking() {
    this.state.nextKeyList.pop();
    this.setState({        
      param: {
        ...this.state.param,
        nextKey: this.state.nextKeyList.at(-1) || ''
      }, 
      loadingDiarys: true });
  }

  onLimitChanging = (newLimit: number) => {
    this.setState({ 
      loadingDiarys: true,
      nextKeyList: [], 
      param: {
        ...this.state.param,
        limit: newLimit,
        nextKey: ''
      }
    });
  }

  async componentDidMount() {
    try {
      const result = await getDiarys(this.props.auth.getIdToken(), this.state.param);
      this.setState({
        diarys: result.items,
        param: {
          ...this.state.param,
          nextKey: result.nextKey ?? '',
        },
        loadingDiarys: false
      })
    } catch (e) {
      alert(`Failed to fetch diarys`)
    }
  }

  async componentDidUpdate(prevProps: any, prevState: DiarysState) {
    if (this.state.loadingDiarys !== prevState.loadingDiarys && this.state.loadingDiarys) {
      await this.componentDidMount();
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Diary</Header>

        {this.renderCreateDiaryInput()}
        {this.renderDiarys()}
        {this.renderPaginator()}
        {this.renderCreateEmailInput()}
      </div>
    )
  }

  renderPaginator() {
    return (
      <Container style={{ paddingBottom: '18px', textAlign: 'left' }}>
        <span style={{ marginRight: '4px' }}>
          Page size:
        </span>
        <Select 
          style={{ marginRight: '8px' }}
          options={SIZE_PAGES_5} 
          value={this.state.param.limit} 
          onChange={(e, data) => this.onLimitChanging(Number(data.value))} 
        /> 
        <Button 
          primary
          content='Previous Page'
          onClick={() => this.handlePreviousClicking()}
          disabled={(this.state.nextKeyList.length === 0)} 
        />
        <Button 
          primary
          content='Next Page'
          onClick={() => this.handleNextClicking()}
          disabled={(this.state.param.nextKey === null || this.state.param.nextKey === '')} 
        />
      </Container>
    )
  }

  renderCreateEmailInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'yellow',
              labelPosition: 'left',
              icon: 'add',
              content: 'Email Sign Up: ',
              onClick: this.onCreateEmail
            }}
            actionPosition="left"
            placeholder="Enter email here to receive notifications..."
            onChange={this.handleEmailChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderCreateDiaryInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'red',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Diary Entry ',
              onClick: this.onDiaryCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Enter Diary Entry Here"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderDiarys() {
    if (this.state.loadingDiarys) {
      return this.renderLoading()
    }

    return this.renderDiarysList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading diarys
        </Loader>
      </Grid.Row>
    )
  }

  renderDiarysList() {
    return (
      <Grid padded>
        {this.state.diarys.map((diary, pos) => {
          return (
            <Grid.Row key={diary.diaryId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onDiaryCheck(pos)}
                  checked={diary.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {diary.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {diary.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="green"
                  onClick={() => this.onEditButtonClick(diary.diaryId)}
                >
                  <Icon name="edit" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onDiaryDelete(diary.diaryId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {diary.attachmentUrl && (
                <Image src={diary.attachmentUrl} size="small" wrapped centered />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'dd/mm/yyyy') as string
  }
}
