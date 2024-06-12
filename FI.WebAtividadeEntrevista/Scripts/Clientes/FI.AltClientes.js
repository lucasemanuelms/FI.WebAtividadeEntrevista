var dataContainer = document.getElementById('data-container');
var listaBeneficiarios = JSON.parse(dataContainer.getAttribute('data-items'));

$(document).ready(function () {
    $('#CPF').mask('000.000.000-00');
    $('#CEP').mask('00000-000');
    $('#Telefone').mask('(00)00000-0000');
    $('#benefCPF').mask('000.000.000-00');

    if (obj) {
        $('#formCadastro #Nome').val(obj.Nome);
        $('#formCadastro #CEP').val(obj.CEP);
        $('#formCadastro #Email').val(obj.Email);
        $('#formCadastro #Sobrenome').val(obj.Sobrenome);
        $('#formCadastro #Nacionalidade').val(obj.Nacionalidade);
        $('#formCadastro #Estado').val(obj.Estado);
        $('#formCadastro #Cidade').val(obj.Cidade);
        $('#formCadastro #Logradouro').val(obj.Logradouro);
        $('#formCadastro #Telefone').val(obj.Telefone);
        $('#formCadastro #CPF').val(obj.CPF);
    }

    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        let cpf = $(this).find("#CPF").val();

        if (!validarCPF(cpf)) {
            ModalDialog("O CPF informado é inválido. Verifique!")
        } else {

            $.ajax({
                url: urlPost,
                method: "POST",
                data: {
                    "NOME": $(this).find("#Nome").val(),
                    "CEP": $(this).find("#CEP").val(),
                    "Email": $(this).find("#Email").val(),
                    "Sobrenome": $(this).find("#Sobrenome").val(),
                    "Nacionalidade": $(this).find("#Nacionalidade").val(),
                    "Estado": $(this).find("#Estado").val(),
                    "Cidade": $(this).find("#Cidade").val(),
                    "Logradouro": $(this).find("#Logradouro").val(),
                    "Telefone": $(this).find("#Telefone").val(),
                    "CPF": $(this).find("#CPF").val(),
                    "Beneficiarios": listaBeneficiarios
                },
                error:
                    function (r) {
                        if (r.status == 400)
                            ModalDialog("Ocorreu um erro", r.responseJSON);
                        else if (r.status == 500)
                            ModalDialog("Ocorreu um erro", "Ocorreu um erro interno no servidor.");
                    },
                success:
                    function (r) {
                        ModalDialog("Sucesso!", r)
                        $("#formCadastro")[0].reset();
                        window.location.href = urlRetorno;
                    }
            });
        }
    })

    $("#formBeneficiario").on("submit", function (event) {
        event.preventDefault();

        const Id = $("#benefId").val();
        const CPF = $("#benefCPF").val();
        const Nome = $("#benefNome").val();

        if (!validarCPF(CPF)) {
            ModalDialog("O CPF informado é inválido. Verifique!");
        } else {
            if (!beneficiarioJaSalvo(CPF)) {
                let beneficiario = {
                    Id,
                    CPF,
                    Nome
                };

                if (beneficiario.Id == null) {
                    beneficiario.Oper = 2;
                } else {
                    beneficiario.Oper = 1;
                }

                listaBeneficiarios.push(beneficiario);

                adicionarNaTabela();

                $("#benefId").val('');
                $("#benefCPF").val('');
                $("#benefNome").val('');
            } else {
                ModalDialog("O beneficiario já está cadastrado!");
            }
        }
    });

    $('#tabelaBeneficiarios').on('click', '.btn-alterar', function () {
        var rowIndex = $(this).closest('tr').index();

        alterarBeneficiario(rowIndex);
    });

    $('#tabelaBeneficiarios').on('click', '.btn-excluir', function () {
        var rowIndex = $(this).closest('tr').index();

        excluirBeneficiario(rowIndex);
    });

})

function ModalDialog(titulo, texto) {
    var random = Math.random().toString().replace('.', '');
    var texto = '<div id="' + random + '" class="modal fade">                                                               ' +
        '        <div class="modal-dialog">                                                                                 ' +
        '            <div class="modal-content">                                                                            ' +
        '                <div class="modal-header">                                                                         ' +
        '                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>         ' +
        '                    <h4 class="modal-title">' + titulo + '</h4>                                                    ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-body">                                                                           ' +
        '                    <p>' + texto + '</p>                                                                           ' +
        '                </div>                                                                                             ' +
        '                <div class="modal-footer">                                                                         ' +
        '                    <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>             ' +
        '                                                                                                                   ' +
        '                </div>                                                                                             ' +
        '            </div><!-- /.modal-content -->                                                                         ' +
        '  </div><!-- /.modal-dialog -->                                                                                    ' +
        '</div> <!-- /.modal -->                                                                                        ';

    $('body').append(texto);
    $('#' + random).modal('show');
}

function validarCPF(cpf) {

    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf == '' || cpf.length != 11 || /^(\d)\1{10}$/.test(cpf))
        return false;

    var add = 0;
    for (var i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    var rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;

    if (rev != parseInt(cpf.charAt(9)))
        return false;

    add = 0;
    for (var i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;

    if (rev != parseInt(cpf.charAt(10)))
        return false;

    return true;
}

function beneficiarioJaSalvo(cpf) {
    return listaBeneficiarios.some(beneficiario => beneficiario.CPF === cpf);
}

function adicionarNaTabela() {
    $("#tabelaBeneficiarios tbody").empty();

    listaBeneficiarios.forEach(function (beneficiario, index) {
        if (beneficiario.Oper !== 0) {
            const newRow = `<tr id="${beneficiario.Id}">
                <td>${beneficiario.CPF}</td>
                <td>${beneficiario.Nome}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-primary btn-alterar" value="${beneficiario.Id}">Alterar</button>
                    <button type="button" class="btn btn-sm btn-primary btn-excluir" value="${beneficiario.Id}">Excluir</button>
                </td>
            </tr>`;
            $("#tabelaBeneficiarios tbody").append(newRow);
        }
    });
}

window.adicionarBotaoAlterar = function (index) {
    const editButton = $('<button>', {
        class: 'btn btn-primary btn-sm',
        text: 'Alterar',
        click: function () {
            alterarBeneficiario(index);
        }
    });
    const td = $('<td>').append(editButton);
    $('#tabelaBeneficiarios tbody tr').eq(index).append(td);
};

window.adicionarBotaoExcluir = function (index) {
    const deleteButton = $('<button>', {
        class: 'btn btn-primary btn-sm',
        text: 'Excluir',
        click: function () {
            excluirBeneficiario(index);
        }
    });
    const td = $('<td>').append(deleteButton);
    $('#tabelaBeneficiarios tbody tr').eq(index).append(td);
};

function alterarBeneficiario(index) {

    const beneficiario = listaBeneficiarios[index];

    console.log(beneficiario);

    $("#benefId").val(beneficiario.Id);
    $("#benefCPF").val(beneficiario.CPF);
    $("#benefNome").val(beneficiario.Nome);

    beneficiario.Oper = 1;

    listaBeneficiarios.splice(index, 1);

    adicionarNaTabela();
}

function excluirBeneficiario(index) {
    const beneficiario = listaBeneficiarios[index];

    if (beneficiario.Id == null) {
        listaBeneficiarios.splice(index, 1);

        adicionarNaTabela();
    } else {

        beneficiario.Oper = 0;

        adicionarNaTabela();
    }
}