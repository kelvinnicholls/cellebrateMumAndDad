import { IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

export class Consts {
  public static API_URL_ROOT: string = '';
  public static API_URL_USERS_ROOT: string = Consts.API_URL_ROOT + 'users';
  public static API_URL_USERS_ROOT_EMAIL: string = Consts.API_URL_USERS_ROOT + '/email';
  public static API_URL_USERS_ROOT_NAME: string = Consts.API_URL_USERS_ROOT + '/name';
  public static API_URL_MEDIA_ROOT: string = Consts.API_URL_ROOT + 'media';
  public static API_URL_MEMORIES_ROOT: string = Consts.API_URL_ROOT + 'memories';
  public static API_URL_MEMORY_ROOT: string = Consts.API_URL_ROOT + 'memory';
  public static API_URL_MEMORIES_ROOT_TITLE: string = Consts.API_URL_MEMORIES_ROOT + '/title';
  public static API_URL_MEDIAS_ROOT: string = Consts.API_URL_ROOT + 'medias';
  public static API_URL_MEDIAS_ROOT_TITLE: string = Consts.API_URL_MEDIAS_ROOT + '/title';
  public static API_URL_MEDIAS_ROOT_PROFILE_PICS: string = Consts.API_URL_MEDIAS_ROOT + '/profilePics';
  public static API_URL_TAGS_ROOT: string = Consts.API_URL_ROOT + 'tags';
  public static API_URL_TAGS_ROOT_TAG: string = Consts.API_URL_TAGS_ROOT + '/tag';
  public static API_URL_PEOPLE_ROOT: string = Consts.API_URL_ROOT + 'people';
  public static API_URL_PEOPLE_ROOT_PERSON: string = Consts.API_URL_PEOPLE_ROOT + '/person';



  public static CONTENT_TYPE = 'Content-Type';
  public static APP_JSON = 'application/json';
  public static MULTIPART_FORM_DATA = 'multipart/form-data';
  public static X_AUTH = 'x-auth';
  public static LOGGED_IN_USER = 'loggedInUser';
  public static TOKEN = 'token';
  //public static EMAIL_PATTERN = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
  public static EMAIL_PATTERN = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public static ALPHANUMERIC_PATTERN = '^[a-zA-Z0-9 ]+$';
  public static CREATE_USER = 'Create User';
  public static UPDATE_USER = 'Update User';
  public static ADD_PHOTO = 'Add Photo';
  public static UPDATE_PHOTO = 'Update Photo';
  public static ADD_MEMORY = 'Add Memory';
  public static UPDATE_MEMORY = 'Update Memory';
  public static UPDATE_CURRENT_USER = 'Update Current User';
  public static DEFAULT_PROFILE_PIC_FILE = 'systemImages/no-profile-pic.jpg';
  public static DEFAULT_PHOTO_PIC_FILE = 'systemImages/no-image-pic.png';
  public static SUCCESS = "Success";
  public static ERROR = "Success";
  public static WARNING = "Warning";
  public static INFO = "Info";
  public static CUSTOM = "Custom";
  public static PHOTO = 'PHOTO';
  public static USER = 'USER';
  public static MEMORY = 'MEMORY';

  public static VIEW = 'view';
  public static EDIT = 'edit';
  public static ADD = 'add';

  public static DATE_TIME_DISPLAY_FORMAT = "MMMM Do YYYY, HH:mm";
  public static DATE_DISPLAY_FORMAT = "DD-MM-YYYY";
  public static DATE_DB_FORMAT = "YYYY-MM-DD";
  public static CHAT_DATE_FORMAT ='h:mm a';

  public static FILE_PICKER_API_KEY = "A0KaiilMGRAavl1oJwvn3z";

  public static FILE_PICKER_SOURCES = ['url',
    'imagesearch',
    'facebook',
    'instagram',
    'googledrive',
    'dropbox',
    'evernote',
    'flickr',
    'box',
    'github',
    'gmail',
    'picasa',
    'onedrive',
    'clouddrive'];
  public static FILE_SYSTEM = 'File System';
  public static WEB = 'Web';
  public static TAGS = 'TAGS';
  public static PEOPLE = 'PEOPLE';

  public static setUrlDomain(urlDomain: string) {
    this.API_URL_ROOT = urlDomain;
  };
  
  public static multiSelectSettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-info btn-block',
    dynamicTitleMaxItems: 2,
    //pullRight: true,
    showCheckAll: false,
    showUncheckAll: false,
    closeOnSelect: true
  };

}