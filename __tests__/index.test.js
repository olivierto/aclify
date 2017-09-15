// @flow
import Acl from '../src/classes/acl';
import Memory from '../src/stores/memory';

const store = new Memory();

describe('Constructor', () => {
  it('Should use default `buckets` names', () => {
    const acl = new Acl(store);

    expect(acl.options.buckets.meta).toEqual('meta');
    expect(acl.options.buckets.parents).toEqual('parents');
    expect(acl.options.buckets.permissions).toEqual('permissions');
    expect(acl.options.buckets.resources).toEqual('resources');
    expect(acl.options.buckets.roles).toEqual('roles');
    expect(acl.options.buckets.users).toEqual('users');
  });

  it('Should use given `buckets` names', () => {
    const acl = new Acl(store, null, {
      buckets: {
        meta: 'Meta',
        parents: 'Parents',
        permissions: 'Permissions',
        resources: 'Resources',
        roles: 'Roles',
        users: 'Users',
      }
    });

    expect(acl.options.buckets.meta).toEqual('Meta');
    expect(acl.options.buckets.parents).toEqual('Parents');
    expect(acl.options.buckets.permissions).toEqual('Permissions');
    expect(acl.options.buckets.resources).toEqual('Resources');
    expect(acl.options.buckets.roles).toEqual('Roles');
    expect(acl.options.buckets.users).toEqual('Users');
  });
});

describe(`Allows`, () => {
  it('guest to view blogs', () => {
    const acl = new Acl();
    acl.allow('guest', 'blogs', 'view', (err) => {
      expect(!err);
    });
  });

  it(`guest to view forums`, () => {
    const acl = new Acl(store);
    acl.allow('guest', 'forums', 'view', (err) => {
      expect(!err);
    });
  });

  it(`member to view/edit/delete blogs`, () => {
    const acl = new Acl(store);
    acl.allow('member', 'blogs', ['edit', 'view', 'delete'], (err) => {
      expect(!err);
    });
  });
});

describe(`Add user roles`, () => {
  it(`joed = guest, jsmith = member, harry = admin, test@test.com = member`, (done) => {
    const acl = new Acl(store);

    acl.addUserRoles('joed', 'guest', (err) => {
      expect(!err);

      acl.addUserRoles('jsmith', 'member', (err) => {
        expect(!err);

        acl.addUserRoles('harry', 'admin', (err) => {
          expect(!err);

          acl.addUserRoles('test@test.com', 'member', (err) => {
            expect(!err);
            done();
          });
        });
      });
    });
  });

  it(`0 = guest, 1 = member, 2 = admin`, (done) => {
    const acl = new Acl(store);

    acl.addUserRoles(0, 'guest', (err) => {
      expect(!err);

      acl.addUserRoles(1, 'member', (err) => {
        expect(!err);

        acl.addUserRoles(2, 'admin', (err) => {
          expect(!err);
          done();
        });
      });
    });
  });
});

describe(`Read user's roles`, () => {
  it(`Run userRoles function`, (done) => {
    const acl = new Acl(store);
    acl.addUserRoles('harry', 'admin', (err) => {
      if (err) return done(err);

      acl.userRoles('harry', (err, roles) => {
        if (err) return done(err);
        expect(roles).toEqual(['admin']);

        acl.hasRole('harry', 'admin', (err, is_in_role) => {
          if (err) return done(err);
          expect(is_in_role).toBeTruthy();

          acl.hasRole('harry', 'no role', (err, is_in_role) => {
            if (err) return done(err);
            expect(is_in_role).toBeFalsy();
            done();
          });
        });
      });
    });
  });
});

describe(`Read role's users`, () => {
  it(`Run roleUsers function`, (done) => {
    const acl = new Acl(store);

    acl.addUserRoles('harry', 'admin', (err) => {
      if (err) return done(err);

      acl.roleUsers('admin', (err, users) => {
        if (err) return done(err);
        expect(users).toContain('harry');
        done();
      });
    });
  });
});


describe(`Allow`, () => {
  it('admin view/add/edit/delete users', (done) => {
    const acl = new Acl(store);

    acl.allow('admin', 'users', ['add', 'edit', 'view', 'delete'], (err) => {
      expect(!err);
      done();
    })
  });

  it(`foo view/edit blogs`, (done) => {
    const acl = new Acl(store);

    acl.allow('foo', 'blogs', ['edit', 'view'], (err) => {
      expect(!err);
      done()
    })
  });

  it(`bar to view/delete blogs`, (done) => {
    const acl = new Acl(store);

    acl.allow('bar', 'blogs', ['view', 'delete'], (err) => {
      expect(!err);
      done();
    });
  });
});

describe(`Add role parents`, () => {
  it(`Add foot and bar roles into baz parent role`, (done) => {
    const acl = new Acl(store);

    acl.addRoleParents('baz', ['foo', 'bar'], (err) => {
      expect(!err);
      done();
    });
  });
});

describe(`Add user roles`, () => {
  it(`Add them`, (done) => {
    const acl = new Acl(store);

    acl.addUserRoles('james', 'baz', (err) => {
      expect(!err);
      done();
    });
  });

  it(`Add them with numeric userId`, (done) => {
    const acl = new Acl(store);

    acl.addUserRoles(3, 'baz', (err) => {
      expect(!err);
      done();
    });
  });
});


describe(`allow admin to do anything`, () => {
  it(`add them`, (done) => {
    const acl = new Acl(store)

    acl.allow('admin', ['blogs', 'forums'], '*', (err) => {
      expect(!err);
      done();
    });
  });
});

describe(`Arguments in one array`, () => {
  it(`Give role fumanchu an array of resources and permissions`, (done) => {
    const acl = new Acl(store);

    acl.allow([{
        roles: 'fumanchu',
        allows: [
          {resources: 'blogs', permissions: 'get'},
          {resources: ['forums', 'news'], permissions: ['get', 'put', 'delete']},
          {resources: ['/path/file/file1.txt', '/path/file/file2.txt'], permissions: ['get', 'put', 'delete']}
        ]
      }],
      (err) => {
        expect(!err);
        done();
      });
  });
});

describe(`Add fumanchu role to suzanne`, () => {
  it(`Do it`, (done) => {
    const acl = new Acl(store);
    acl.addUserRoles('suzanne', 'fumanchu', (err) => {
      expect(!err);
      done();
    })
  });

  it('Do it (numeric userId)', (done) => {
    const acl = new Acl(store);
    acl.addUserRoles(4, 'fumanchu', (err) => {
      expect(!err);
      done();
    })
  })
});
