describe("UploadTask model", function() {
  var form;
  before(function(done) {
    var Form = appForm.models.Form;
    new Form({
      formId: "527d4539639f521e0a000004",
      fromRemote: true
    }, function(err, _form) {
      form = _form;
      done();
    });
  });
  it("how to upload submission form", function(done) {
    this.timeout(100000);
    var submission = form.newSubmission();
    var ut = appForm.models.uploadTask.newInstance(submission);
    ut.uploadForm(function(err) {
      assert(!err);
      var progress = ut.getProgress();
      assert(progress.formJSON);
      done();
    });
  });

  it("how to deal with out of date submission", function(done) {
    this.timeout(100000);
    var submission = form.newSubmission();
    submission.set("outOfDate", true);
    submission.changeStatus("pending", function(err) {
      assert(!err);

      submission.changeStatus("inprogress", function(err) {
        assert(!err);
        var ut = appForm.models.uploadTask.newInstance(submission);
        ut.uploadForm(function(err) {
          assert(err);
          var progress = ut.getProgress();
          assert(!progress.formJSON);
          assert(ut.isCompleted());
          assert(ut.get("error"));
          done();
        });
      });
    });
  });

  it("how to upload a file ", function(done) {
    this.timeout(100000);
    var submission = form.newSubmission();
    submission.changeStatus("pending", function(err) {
      assert(!err);

      submission.changeStatus("inprogress", function(err) {
        assert(!err);

        appForm.utils.fileSystem.save("testfile.txt", "content of the file", function(err) {
          assert(!err);
          appForm.utils.fileSystem.readAsFile("testfile.txt", function(err, file) {
            submission.addInputValue({
              fieldId: "52974ee55e272dcb3d0000a6",
              value: file
            }, function(err) {
              assert(!err);
              var ut = appForm.models.uploadTask.newInstance(submission);
              ut.uploadForm(function(err) {
                assert(!err);

                ut.uploadFile(function(err) {
                  assert(!err);
                  assert(ut.get("currentTask") == 1);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  it("how to upload by tick", function(done) {
    this.timeout(100000);
    var submission = form.newSubmission();
    submission.changeStatus("pending", function(err) {
      assert(!err);

      submission.changeStatus("inprogress", function(err) {
        assert(!err);

        appForm.utils.fileSystem.save("testfile.txt", "content of the file", function(err) {
          assert(!err);
          appForm.utils.fileSystem.readAsFile("testfile.txt", function(err, file) {
            submission.addInputValue({
              fieldId: "52974ee55e272dcb3d0000a6",
              value: file
            }, function(err) {
              assert(!err);
              var ut = appForm.models.uploadTask.newInstance(submission);
              var sending = false;
              var timer = setInterval(function() {
                if (ut.isCompleted()) {
                  clearInterval(timer);
                  assert(ut.get("currentTask") == 1);
                  done();
                }

                if (!sending) {
                  sending = true;
                  ut.uploadTick(function(err) {
                    if (err) {
                      console.error(err);
                      clearInterval(timer);
                    }
                    sending = false;
                    assert(!err);
                  });
                }
              }, 500);
            });
          });
        });
      });
    });
  });
  it("how to check for failed file upload", function(done) {
    this.timeout(100000);
    var submission = form.newSubmission();
    submission.changeStatus("pending", function(err) {
      assert(!err);

      submission.changeStatus("inprogress", function(err) {
        assert(!err);

        appForm.utils.fileSystem.save("testfile.txt", "content of the file", function(err) {
          assert(!err);
          appForm.utils.fileSystem.readAsFile("testfile.txt", function(err, file) {
            submission.addInputValue({
              fieldId: "52974ee55e272dcb3d0000a6",
              value: file
            }, function(err) {
              assert(!err);
              submission.set("testText", "failedFileUpload");
              var ut = appForm.models.uploadTask.newInstance(submission);
              ut.uploadTick(function(err) {
                assert(!err);

                ut.uploadTick(function(err) {
                  assert(err);
                  assert(ut.getCurrentTask() === 0);
                  assert(submission.getStatus() === "inprogress");
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  it("how to check for failed submissionCompletion", function(done) {
    this.timeout(100000);
    var submission = form.newSubmission();
    submission.changeStatus("pending", function(err) {
      assert(!err);

      submission.changeStatus("inprogress", function(err) {
        assert(!err);

        appForm.utils.fileSystem.save("testfile.txt", "content of the file", function(err) {
          assert(!err);
          appForm.utils.fileSystem.readAsFile("testfile.txt", function(err, file) {
            submission.addInputValue({
              fieldId: "52974ee55e272dcb3d0000a6",
              value: file
            }, function(err) {
              assert(!err);
              submission.set("testText", "submissionError");
              var ut = appForm.models.uploadTask.newInstance(submission);

              ut.uploadTick(function(err) {
                assert(!err);

                ut.uploadTick(function(err) {
                  assert(err);
                  assert(ut.getCurrentTask() === 1);

                  assert(submission.getStatus() === "error");
                  done();
                });
              });
            });
          });
        });
      });
    });
  });


  it("how to check for file status", function(done) {
    this.timeout(100000);
    var submission = form.newSubmission();
    submission.changeStatus("pending", function(err) {
      assert(!err);

      submission.changeStatus("inprogress", function(err) {
        assert(!err);

        appForm.utils.fileSystem.save("testfile.txt", "content of the file", function(err) {
          assert(!err);
          appForm.utils.fileSystem.readAsFile("testfile.txt", function(err, file) {
            submission.addInputValue({
              fieldId: "52974ee55e272dcb3d0000a6",
              value: file
            }, function(err) {
              assert(!err);
              submission.set("testText", "submissionStatus");
              var ut = appForm.models.uploadTask.newInstance(submission);

              ut.uploadTick(function(err) {
                assert(!err);

                ut.uploadTick(function(err) {
                  assert(err);
                  assert(submission.getStatus() === "inprogress");

                  ut.uploadTick(function(err) {
                    assert(!err);
                    assert(submission.getStatus() === "submitted");
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it("how to get total upload size", function() {
    this.timeout(100000);
    var submission = form.newSubmission();
    submission.changeStatus("pending", function(err) {
      assert(!err);

      submission.changeStatus("inprogress", function(err) {
        assert(!err);

        var ut = appForm.models.uploadTask.newInstance(submission);
        assert(ut.getTotalSize());
      });
    });
  });

  it("how to get uploaded size", function(done) {
    this.timeout(100000);
    var submission = form.newSubmission();
    submission.changeStatus("pending", function(err) {
      assert(!err);

      submission.changeStatus("inprogress", function(err) {
        assert(!err);

        var ut = appForm.models.uploadTask.newInstance(submission);
        assert(ut.getTotalSize());
        assert(ut.getUploadedSize() == 0);
        ut.uploadTick(function() {
          assert(ut.getTotalSize() == ut.getUploadedSize());
          done();
        });
      });
    });
  });

  it("how to upload photo/signature", function(done) {
    this.timeout(100000);
    var submission = form.newSubmission();
    submission.changeStatus("pending", function(err) {
      assert(!err);

      submission.changeStatus("inprogress", function(err) {
        assert(!err);

        appForm.utils.fileSystem.save("testfile.txt", "content of the file", function(err) {
          assert(!err);
          appForm.utils.fileSystem.readAsFile("testfile.txt", function(err, file) {
            submission.addInputValue({
              fieldId: "52974ee55e272dcb3d0000a6",
              value: file
            }, function(err) {
              assert(!err);
              var ut = appForm.models.uploadTask.newInstance(submission);
              ut.uploadForm(function(err) {
                assert(!err);

                ut.uploadFile(function(err) {
                  assert(!err);
                  assert(ut.get("currentTask") == 1);
                  done();
                });
              });
            });
          });
        });
      });
    });
  })
});