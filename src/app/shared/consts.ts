export class Consts {
  public static API_URL_ROOT: string = 'http://localhost:3000/';
  public static API_URL_USERS_ROOT: string = Consts.API_URL_ROOT + 'users';
  public static API_URL_MEDIA_ROOT: string = Consts.API_URL_ROOT + 'media';
  public static API_URL_MEMORIES_ROOT: string = Consts.API_URL_ROOT + 'memories';
  public static API_URL_MEMORY_ROOT: string = Consts.API_URL_ROOT + 'memory';
  public static API_URL_MEDIAS_ROOT: string = Consts.API_URL_ROOT + 'medias';
  public static CONTENT_TYPE = 'Content-Type';
  public static APP_JSON = 'application/json';
  public static MULTIPART_FORM_DATA = 'multipart/form-data';
  public static X_AUTH = 'x-auth';
  public static LOGGED_IN_USER = 'loggedInUser';
  public static TOKEN = 'token';
  public static EMAIL_PATTERN = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";

  public static CREATE_USER = 'Create User';
  public static UPDATE_USER = 'Update User';
  public static UPDATE_CURRENT_USER = 'Update Current User';
}