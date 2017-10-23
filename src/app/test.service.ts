export class TestService {

    static sendInput(inputElement: any, text: string, fixture: any) {

        console.log("TestService","sendInput","inputElement",inputElement,"text",text);
        inputElement.value = text;
        console.log("TestService",1);
        inputElement.dispatchEvent(new Event('input'));
        console.log("TestService",2);
        fixture.detectChanges();
;
        return fixture.whenStable();
    }

}