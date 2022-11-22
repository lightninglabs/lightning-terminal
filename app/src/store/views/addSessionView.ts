import { makeAutoObservable, observable } from 'mobx';
import { Store } from 'store';
import * as LIT from 'types/generated/lit-sessions_pb';
import { MAX_DATE, PermissionUriMap } from 'util/constants';

export default class AddSessionView {
  private _store: Store;

  label = '';
  permissionType = 'admin'; // Expected values: admin | read-only | custom | liquidity | payments
  editing = false;
  permissions: { [key: string]: boolean } = {
    openChannel: false,
    closeChannel: false,
    setFees: false,
    loop: false,
    pool: false,
    send: false,
    receive: false,
  };
  expiration = 'never'; // Expected values: 7 | 30 | 60 | 90 | never | custom
  expirationOptions = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '60 Days', value: '60' },
    { label: '90 Days', value: '90' },
    { label: 'Never', value: 'never' },
    { label: 'Custom', value: 'custom' },
  ];
  expirationDate = '';
  showAdvanced = false;
  proxy = '';

  constructor(store: Store) {
    makeAutoObservable(
      this,
      {
        permissions: observable.deep,
      },
      { deep: false, autoBind: true },
    );

    this._store = store;
  }

  //
  // Computed properties
  //

  get sessionType() {
    if (this.permissionType === 'admin') {
      return LIT.SessionType.TYPE_MACAROON_ADMIN;
    } else if (this.permissionType === 'read-only') {
      return LIT.SessionType.TYPE_MACAROON_READONLY;
    }

    return LIT.SessionType.TYPE_MACAROON_CUSTOM;
  }

  get sessionDate() {
    // If the expiration date is a number of days
    if (Number.isInteger(parseInt(this.expiration))) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parseInt(this.expiration));
      return expirationDate;
    } else if (this.expiration === 'custom') {
      return new Date(this.expirationDate);
    }

    // Default to max date for when the expiration is "never"
    return MAX_DATE;
  }

  get sessionProxy() {
    if (this.proxy) {
      return this.proxy;
    }

    return undefined;
  }

  get getMacaroonPermissions() {
    // Only output macaroon permissions when the session type is custom
    if (this.sessionType === LIT.SessionType.TYPE_MACAROON_CUSTOM) {
      // Include all read-only URIs by default
      const permissions: string[] = ['***readonly***'];

      // Loop over all permissions to determine which are enabled
      Object.entries(this.permissions).forEach(([permissionName, permissionEnabled]) => {
        if (permissionEnabled) {
          // Add all of the URIs for this permission
          permissions.push(...PermissionUriMap[permissionName]);
        }
      });

      // Convert all of the permission strings into MacaroonPermission objects
      return permissions.map(uri => {
        const mp = new LIT.MacaroonPermission();
        mp.setEntity('uri');
        mp.setAction(uri);
        return mp;
      });
    }

    return [];
  }

  //
  // Actions
  //

  setLabel(label: string) {
    this.label = label;
  }

  setExpiration(expiration: string) {
    this.expiration = expiration;
  }

  setExpirationDate(expirationDate: string) {
    this.expirationDate = expirationDate;
  }

  setProxy(proxy: string) {
    this.proxy = proxy;
  }

  setPermissionType(permissionType: string) {
    this.permissionType = permissionType;

    switch (permissionType) {
      case 'admin':
        this.setAllPermissions(true);
        break;

      case 'read-only':
        this.setAllPermissions(false);
        break;

      case 'liquidity':
        this.setAllPermissions(false);
        this.permissions.setFees = true;
        this.permissions.loop = true;
        this.permissions.pool = true;
        break;

      case 'payments':
        this.setAllPermissions(false);
        this.permissions.send = true;
        this.permissions.receive = true;
        break;

      case 'custom':
        // We don't need to change anything, let the user customize permissions how they want
        break;
    }
  }

  togglePermission(permission: string) {
    this.setPermissionType('custom');
    this.permissions[permission] = !this.permissions[permission];
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  cancel() {
    this.label = '';
    this.permissionType = 'admin';
    this.editing = false;
    this.setAllPermissions(false);
    this.expiration = 'never';
    this.showAdvanced = false;
    this._store.settingsStore.sidebarVisible = true;
  }

  //
  // Async Actions
  //

  async handleSubmit() {
    if (this.permissionType === 'custom') {
      this._store.settingsStore.sidebarVisible = false;
      this._store.router.push('/connect/custom');
    } else {
      const session = await this._store.sessionStore.addSession(
        this.label,
        this.sessionType,
        MAX_DATE,
        true,
      );

      if (session) {
        this.cancel();
      }
    }
  }

  async handleCustomSubmit() {
    let label = this.label;

    // Automatically generate human friendly labels for custom sessions
    if (label === '') {
      label = `My ${this.permissionType} session`;
    }

    const session = await this._store.sessionStore.addSession(
      label,
      this.sessionType,
      this.sessionDate,
      true,
      this.sessionProxy,
      this.getMacaroonPermissions,
    );

    if (session) {
      this.cancel();
      this._store.router.push('/connect');
    }
  }

  //
  // Private helper functions
  //

  private setAllPermissions(value: boolean) {
    Object.keys(this.permissions).forEach(permissionName => {
      this.permissions[permissionName] = value;
    });
  }
}
