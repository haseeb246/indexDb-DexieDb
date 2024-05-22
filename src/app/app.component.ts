import { Component } from '@angular/core';
import { UserDto } from 'src/index-db/model/user.model';
import { DBStores } from 'src/index-db/sevices/idb.store.model';
import { DataService } from './../index-db/sevices/data.service';
import { API_ENDPOINTS } from './constants/endpoints';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'indexdb-app';
  userList: UserDto[] = [];
  user: UserDto = new UserDto();
  constructor(private dataService: DataService) {}
  async ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    debugger;
    await this.refreshList();
    console.log(this.userList);
    // let unit = (await this.dataService.getListAsync(
    //   DBStores.Unit.TableName,
    //   API_ENDPOINTS.unit
    // )) as IUser[];

    // console.log(unit);
  }

  async refreshList() {
    this.userList = await this.dataService.getListAsync(
      DBStores.User.TableName,
      API_ENDPOINTS.user
    );
  }

  async addNewListType() {
    debugger;
    if (this.user.name) {
      await this.dataService.addUpdateCache(DBStores.User.TableName, this.user);
      await this.refreshList();
      // await db.readingLists.add({
      //   title: this.readingListName,
      // });

      this.resetField();
    }
  }

  // async resetDatabases() {
  //   await db.resetDatabase();
  // }

  /**
   * uses angular's TrackBy feature to only track changes made to DB
   * requires this function (see docs): https://angular.io/api/core/TrackByFunction
   */
  readingListTrackBy(index: number, list: UserDto) {
    return `${list.id}${list.name}`;
  }

  private resetField() {
    this.user = new UserDto();
  }

  async editUser(user: UserDto) {
    this.user = user;
    // Implement your logic here. You could open a modal dialog with a form,
    // or navigate to a route with a form to edit the selected user.
    // For example, using a modal service:
    // this.modalService.open(EditUserModalComponent, { data: user });
    await this.dataService.addUpdateCache(DBStores.User.TableName, this.user);
    await this.refreshList();
    console.log('Editing user', user);
  }

  async deleteUser(user: UserDto) {
    // You may want to show a confirmation dialog before deleting.

    // If you're updating the server, call the delete API and then remove the user from the list
    // this.userService.deleteUser(user.id).subscribe(() => {
    // Remove the user from the userList array after confirming the deletion
    debugger;
    await this.dataService.deleteCache(DBStores.User.TableName, this.user.id);
    // });

    window.location.reload();
    // setTimeout(async () => {
    //   await this.refreshList();
    // }, 20);
    console.log('Deleting user', user);
  }
}
