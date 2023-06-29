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
  Loader
} from 'semantic-ui-react'

import { createDiary, deleteDiary, getDiarys, patchDiary } from '../api/diarys-api'
import Auth from '../auth/Auth'
import { Diary } from '../types/Diary'

interface DiarysProps {
  auth: Auth
  history: History
}

interface DiarysState {
  diarys: Diary[]
  newDiaryName: string
  loadingDiarys: boolean
}

export class Diarys extends React.PureComponent<DiarysProps, DiarysState> {
  state: DiarysState = {
    diarys: [],
    newDiaryName: '',
    loadingDiarys: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newDiaryName: event.target.value })
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
        newDiaryName: ''
      })
    } catch {
      alert('diary creation failed')
    }
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

  async componentDidMount() {
    try {
      const diarys = await getDiarys(this.props.auth.getIdToken())
      this.setState({
        diarys,
        loadingDiarys: false
      })
    } catch (e) {
      alert(`Failed to fetch diarys: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Diary</Header>

        {this.renderCreateDiaryInput()}

        {this.renderDiarys()}
      </div>
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
